import { prisma } from '../config/database';
import { yahooFinanceService } from './yahoo-finance.service';
import { cache } from './cache.service';

interface StockInfo {
  name: string;
  symbol: string;
}

class HistoricalDataService {
  private readonly BATCH_SIZE = 5;
  private readonly DELAY_BETWEEN_BATCHES = 2000; // 2 seconds

  /**
   * جلب وحفظ البيانات التاريخية لجميع الأسهم المصرية
   */
  async populateHistoricalData(period: '1y' | '2y' = '1y'): Promise<void> {
    try {
      console.log('🚀 بدء جلب البيانات التاريخية للأسهم المصرية...');
      
      // قراءة قائمة الأسهم
      const egxStocksPath = require('path').join(__dirname, '../data/egx-stocks.json');
      const egxStocks: StockInfo[] = require(egxStocksPath);
      
      console.log(`📊 العدد الإجمالي للأسهم: ${egxStocks.length}`);
      
      let successCount = 0;
      let errorCount = 0;
      
      // معالجة الأسهم في مجموعات صغيرة
      for (let i = 0; i < egxStocks.length; i += this.BATCH_SIZE) {
        const batch = egxStocks.slice(i, i + this.BATCH_SIZE);
        console.log(`\n🔄 معالجة المجموعة ${Math.floor(i / this.BATCH_SIZE) + 1}/${Math.ceil(egxStocks.length / this.BATCH_SIZE)}`);
        
        // معالجة كل سهم في المجموعة بالتوازي
        const batchPromises = batch.map(async (stock) => {
          try {
            await this.fetchAndSaveHistoricalData(stock.symbol, period);
            console.log(`✅ ${stock.symbol} (${stock.name})`);
            successCount++;
          } catch (error) {
            console.error(`❌ ${stock.symbol} (${stock.name}):`, error);
            errorCount++;
          }
        });
        
        await Promise.allSettled(batchPromises);
        
        // انتظار قبل المجموعة التالية
        if (i + this.BATCH_SIZE < egxStocks.length) {
          console.log(`⏱️ انتظار ${this.DELAY_BETWEEN_BATCHES / 1000} ثانية...`);
          await new Promise(resolve => setTimeout(resolve, this.DELAY_BETWEEN_BATCHES));
        }
      }
      
      console.log(`\n🎉 انتهاء جلب البيانات التاريخية:`);
      console.log(`✅ نجح: ${successCount} سهم`);
      console.log(`❌ فشل: ${errorCount} سهم`);
      
    } catch (error) {
      console.error('❌ خطأ في جلب البيانات التاريخية:', error);
      throw error;
    }
  }

  /**
   * جلب وحفظ البيانات التاريخية لسهم واحد
   */
  async fetchAndSaveHistoricalData(symbol: string, period: '1y' | '2y' = '1y'): Promise<void> {
    try {
      // التحقق من وجود البيانات مسبقاً
      const existingDataCount = await prisma.historicalData.count({
        where: { symbol: symbol.replace('.CA', '') }
      });
      
      if (existingDataCount > 0) {
        console.log(`⏭️ تخطي ${symbol} - البيانات موجودة مسبقاً (${existingDataCount} سجل)`);
        return;
      }

      // جلب البيانات من Yahoo Finance
      const historicalData = await yahooFinanceService.getHistoricalData(symbol, period);
      
      if (!historicalData || historicalData.length === 0) {
        throw new Error('لا توجد بيانات تاريخية متاحة');
      }

      // تحويل البيانات لصيغة قاعدة البيانات
      const dbData = historicalData.map(item => ({
        symbol: symbol.replace('.CA', ''),
        dateTime: item.date,
        openPrice: item.open,
        highPrice: item.high,
        lowPrice: item.low,
        closePrice: item.close,
        volume: BigInt(item.volume),
        adjustedClose: item.adjustedClose
      }));

      // حفظ البيانات في قاعدة البيانات
      await prisma.historicalData.createMany({
        data: dbData
      });

      // تحديث cache للسوق
      await this.updateMarketDataCache(symbol, historicalData[historicalData.length - 1]);

      console.log(`💾 تم حفظ ${dbData.length} سجل تاريخي لـ ${symbol}`);
      
    } catch (error) {
      console.error(`❌ خطأ في جلب البيانات التاريخية لـ ${symbol}:`, error);
      throw error;
    }
  }

  /**
   * تحديث cache البيانات الحالية للسوق
   */
  private async updateMarketDataCache(symbol: string, latestData: any): Promise<void> {
    try {
      const cleanSymbol = symbol.replace('.CA', '');
      
      // جلب quote حالي للحصول على معلومات إضافية
      const quote = await yahooFinanceService.getQuote(cleanSymbol);
      
      if (!quote) return;

      // تحديث أو إنشاء cache entry
      await prisma.marketDataCache.upsert({
        where: { symbol: cleanSymbol },
        update: {
          companyName: quote.companyName,
          currentPrice: quote.currentPrice,
          previousClose: quote.previousClose,
          priceChange: quote.priceChange,
          priceChangePercent: quote.priceChangePercent,
          volume: BigInt(quote.volume),
          marketCap: quote.marketCap,
          sector: quote.sector,
          lastUpdated: new Date(),
          isActive: true
        },
        create: {
          symbol: cleanSymbol,
          companyName: quote.companyName,
          currentPrice: quote.currentPrice,
          previousClose: quote.previousClose,
          priceChange: quote.priceChange,
          priceChangePercent: quote.priceChangePercent,
          volume: BigInt(quote.volume),
          marketCap: quote.marketCap,
          sector: quote.sector,
          lastUpdated: new Date(),
          isActive: true
        }
      });

    } catch (error) {
      console.error(`❌ خطأ في تحديث cache لـ ${symbol}:`, error);
    }
  }

  /**
   * جلب البيانات التاريخية لسهم من قاعدة البيانات
   */
  async getHistoricalDataFromDB(symbol: string, days: number = 365): Promise<any[]> {
    try {
      const cleanSymbol = symbol.replace('.CA', '');
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - days);

      const data = await prisma.historicalData.findMany({
        where: {
          symbol: cleanSymbol,
          dateTime: {
            gte: fromDate
          }
        },
        orderBy: {
          dateTime: 'asc'
        }
      });

      return data.map(item => ({
        date: item.dateTime,
        open: Number(item.openPrice),
        high: Number(item.highPrice),
        low: Number(item.lowPrice),
        close: Number(item.closePrice),
        volume: Number(item.volume),
        adjustedClose: Number(item.adjustedClose)
      }));

    } catch (error) {
      console.error(`❌ خطأ في جلب البيانات التاريخية من قاعدة البيانات لـ ${symbol}:`, error);
      return [];
    }
  }

  /**
   * احصائيات قاعدة البيانات
   */
  async getDataStats(): Promise<any> {
    try {
      const totalRecords = await prisma.historicalData.count();
      const uniqueSymbols = await prisma.historicalData.groupBy({
        by: ['symbol'],
        _count: {
          symbol: true
        }
      });

      const marketCacheCount = await prisma.marketDataCache.count();
      
      const oldestRecord = await prisma.historicalData.findFirst({
        orderBy: { dateTime: 'asc' },
        select: { dateTime: true }
      });

      const newestRecord = await prisma.historicalData.findFirst({
        orderBy: { dateTime: 'desc' },
        select: { dateTime: true }
      });

      return {
        totalHistoricalRecords: totalRecords,
        uniqueSymbols: uniqueSymbols.length,
        marketCacheEntries: marketCacheCount,
        dateRange: {
          oldest: oldestRecord?.dateTime,
          newest: newestRecord?.dateTime
        },
        symbolStats: uniqueSymbols.map(s => ({
          symbol: s.symbol,
          recordCount: s._count.symbol
        })).slice(0, 10) // أول 10 أسهم كمثال
      };

    } catch (error) {
      console.error('❌ خطأ في جلب احصائيات البيانات:', error);
      return null;
    }
  }

  /**
   * تحديث البيانات للأسهم النشطة فقط
   */
  async updateActiveStocks(): Promise<void> {
    try {
      console.log('🔄 تحديث البيانات للأسهم النشطة...');
      
      const activeStocks = await prisma.marketDataCache.findMany({
        where: { isActive: true },
        select: { symbol: true }
      });

      console.log(`📈 عدد الأسهم النشطة: ${activeStocks.length}`);

      for (const stock of activeStocks) {
        try {
          const quote = await yahooFinanceService.getQuote(stock.symbol);
          if (quote) {
            await prisma.marketDataCache.update({
              where: { symbol: stock.symbol },
              data: {
                currentPrice: quote.currentPrice,
                previousClose: quote.previousClose,
                priceChange: quote.priceChange,
                priceChangePercent: quote.priceChangePercent,
                volume: BigInt(quote.volume),
                lastUpdated: new Date()
              }
            });
          }
        } catch (error) {
          console.error(`❌ خطأ في تحديث ${stock.symbol}:`, error);
        }
        
        // انتظار قصير بين كل طلب
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      console.log('✅ انتهاء تحديث الأسهم النشطة');

    } catch (error) {
      console.error('❌ خطأ في تحديث الأسهم النشطة:', error);
    }
  }
}

export const historicalDataService = new HistoricalDataService();
