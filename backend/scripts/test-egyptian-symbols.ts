import { PrismaClient } from '@prisma/client';
import yahooFinance from 'yahoo-finance2';

const prisma = new PrismaClient();

// Egyptian stock symbols to try
const egyptianSymbols = [
  '^CASE30',     // EGX 30 Price Return Index (الرمز الرسمي)
  'CASE30',      // نفس الرمز بدون ^
  '^EGX30',      // EGX 30 (محاولة أخرى)
  'EGX30',       // بدون ^
  'ISPN',        // رمز مقترح
  'ISPN.CA',     // مع extension المصري
  'EGX30.CA',    // EGX 30 مع extension
  'CASE30.CA',   // CASE30 مع extension
  'EGPT',        // VanEck Vectors Egypt Index ETF
  'EEM',         // iShares MSCI Emerging Markets ETF
  'COMI.CA',     // Commercial International Bank (للتأكد)
  'ETEL.CA',     // Egyptian Company for Mobile Services
  'HRHO.CA',     // Hassan Allam Holding
];

async function testEgyptianSymbols() {
  console.log('🔍 اختبار رموز البورصة المصرية...\n');
  
  const availableSymbols: any[] = [];
  
  for (const symbol of egyptianSymbols) {
    try {
      console.log(`📊 اختبار ${symbol}...`);
      
      // جلب بيانات السهم
      const quote = await yahooFinance.quoteSummary(symbol, {
        modules: ['price', 'summaryDetail']
      });
      
      if (quote && quote.price) {
        const stockData = {
          symbol: symbol,
          name: quote.price.shortName || quote.price.longName || symbol,
          price: quote.price.regularMarketPrice || 0,
          change: quote.price.regularMarketChange || 0,
          changePercent: quote.price.regularMarketChangePercent || 0,
          volume: quote.price.regularMarketVolume || 0,
          marketCap: quote.summaryDetail?.marketCap || 0,
          exchange: quote.price.exchangeName || 'Unknown'
        };
        
        availableSymbols.push(stockData);
        console.log(`✅ ${symbol} متاح: ${stockData.name} - ${stockData.price}`);
        
        // إضافة إلى قاعدة البيانات
        try {
          await prisma.stock.upsert({
            where: { symbol: symbol },
            update: {
              name: stockData.name,
              exchange: stockData.exchange,
              sector: 'Index', // تحديد القطاع كمؤشر
              lastUpdated: new Date()
            },
            create: {
              symbol: symbol,
              name: stockData.name,
              exchange: stockData.exchange,
              sector: 'Index',
              currency: 'EGP',
              isActive: true,
              lastUpdated: new Date()
            }
          });
          console.log(`💾 تم حفظ ${symbol} في قاعدة البيانات`);
        } catch (dbError) {
          console.log(`❌ خطأ في حفظ ${symbol}:`, dbError);
        }
        
      } else {
        console.log(`❌ ${symbol} غير متاح`);
      }
      
      // تأخير بسيط لتجنب Rate Limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error: any) {
      console.log(`❌ ${symbol} خطأ: ${error.message}`);
      
      // تأخير أطول في حالة الخطأ
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log('\n📋 ملخص الرموز المتاحة:');
  console.log('=' .repeat(50));
  
  if (availableSymbols.length === 0) {
    console.log('❌ لم يتم العثور على أي رموز متاحة للبورصة المصرية');
    console.log('💡 سيتم استخدام ^EGX30CAPPED.CA كرمز افتراضي');
  } else {
    availableSymbols.forEach((stock, index) => {
      console.log(`${index + 1}. ${stock.symbol} - ${stock.name}`);
      console.log(`   السعر: ${stock.price} | التغيير: ${stock.changePercent?.toFixed(2)}%`);
      console.log(`   البورصة: ${stock.exchange} | الحجم: ${stock.volume?.toLocaleString()}`);
      console.log('');
    });
    
    // اقتراح أفضل رمز للاستخدام
    const bestSymbol = availableSymbols.find(s => 
      s.symbol.includes('CASE30') || s.symbol.includes('EGX30')
    ) || availableSymbols[0];
    
    console.log(`🎯 الرمز المقترح للاستخدام: ${bestSymbol.symbol}`);
    console.log(`📊 ${bestSymbol.name} - ${bestSymbol.price}`);
  }
}

async function main() {
  try {
    console.log('🚀 بدء اختبار رموز البورصة المصرية...\n');
    await testEgyptianSymbols();
  } catch (error) {
    console.error('❌ خطأ عام:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\n✅ انتهاء الاختبار');
  }
}

main().catch(console.error);
