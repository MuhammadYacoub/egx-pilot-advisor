import { Request, Response } from 'express';
import { z } from 'zod';
import { yahooFinanceService } from '../services/yahoo-finance.service';
import { cache } from '../services/cache.service';

// Schema للتحقق من صحة المدخلات
const getQuoteSchema = z.object({
  symbol: z.string().min(1, 'رمز السهم مطلوب'),
});

const getHistoricalDataSchema = z.object({
  symbol: z.string().min(1, 'رمز السهم مطلوب'),
  period: z.enum(['1d', '5d', '1mo', '3mo', '6mo', '1y', '2y']).optional().default('1y'),
});

const searchSymbolsSchema = z.object({
  query: z.string().min(2, 'الاستعلام يجب أن يكون على الأقل حرفين'),
  limit: z.coerce.number().min(1).max(50).optional().default(10),
});

const getMultipleQuotesSchema = z.object({
  symbols: z.array(z.string()).min(1, 'يجب تحديد رمز واحد على الأقل').max(20, 'الحد الأقصى 20 رمز'),
});

/**
 * الحصول على بيانات سهم واحد
 * GET /api/market/quote/:symbol
 */
export const getQuote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { symbol } = getQuoteSchema.parse({ symbol: req.params.symbol });
    
    // البحث في الكاش أولاً
    const cacheKey = `quote_${symbol.toUpperCase()}`;
    const cachedQuote = cache.get(cacheKey);
    
    if (cachedQuote) {
      res.json({
        success: true,
        data: cachedQuote,
        cached: true,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // جلب البيانات من Yahoo Finance
    const quote = await yahooFinanceService.getQuote(symbol);
    
    if (!quote) {
      res.status(404).json({
        success: false,
        error: 'لم يتم العثور على السهم المطلوب',
        symbol,
      });
      return;
    }

    // حفظ في الكاش
    cache.set(cacheKey, quote, 30000); // 30 ثانية

    res.json({
      success: true,
      data: quote,
      cached: false,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('خطأ في جلب بيانات السهم:', error);
    
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'بيانات غير صحيحة',
        details: error.errors,
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'خطأ في الخادم أثناء جلب بيانات السهم',
    });
  }
};

/**
 * الحصول على بيانات تاريخية لسهم
 * GET /api/market/historical/:symbol
 */
export const getHistoricalData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { symbol } = getQuoteSchema.parse({ symbol: req.params.symbol });
    const { period } = getHistoricalDataSchema.parse(req.query);
    
    // البحث في الكاش أولاً
    const cacheKey = `historical_${symbol.toUpperCase()}_${period}`;
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      res.json({
        success: true,
        data: cachedData,
        cached: true,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // جلب البيانات التاريخية
    const historicalData = await yahooFinanceService.getHistoricalData(symbol, period);
    
    if (!historicalData || historicalData.length === 0) {
      res.status(404).json({
        success: false,
        error: 'لم يتم العثور على بيانات تاريخية للسهم المطلوب',
        symbol,
      });
      return;
    }

    const result = {
      symbol: symbol.toUpperCase(),
      period,
      data: historicalData,
      count: historicalData.length,
    };

    // حفظ في الكاش (5 دقائق للبيانات التاريخية)
    cache.set(cacheKey, result, 300000);

    res.json({
      success: true,
      data: result,
      cached: false,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('خطأ في جلب البيانات التاريخية:', error);
    
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'بيانات غير صحيحة',
        details: error.errors,
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'خطأ في الخادم أثناء جلب البيانات التاريخية',
    });
  }
};

/**
 * البحث عن الأسهم
 * GET /api/market/search?query=xxx
 */
export const searchSymbols = async (req: Request, res: Response): Promise<void> => {
  try {
    const { query, limit } = searchSymbolsSchema.parse(req.query);
    
    // البحث في الكاش أولاً
    const cacheKey = `search_${query.toLowerCase()}_${limit}`;
    const cachedResults = cache.get(cacheKey);
    
    if (cachedResults) {
      res.json({
        success: true,
        data: cachedResults,
        cached: true,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // مؤقتاً سنعيد قائمة من الأسهم المصرية الرئيسية
    const egyptianStocks = [
      { symbol: 'CIB.CA', name: 'Commercial International Bank', exchange: 'EGX', type: 'Stock' },
      { symbol: 'ETEL.CA', name: 'Egyptian Company for Mobile Services', exchange: 'EGX', type: 'Stock' },
      { symbol: 'COMM.CA', name: 'Palm Hills Developments', exchange: 'EGX', type: 'Stock' },
      { symbol: 'COMI.CA', name: 'Commercial International Bank', exchange: 'EGX', type: 'Stock' },
      { symbol: 'PHDC.CA', name: 'Palm Hills Developments', exchange: 'EGX', type: 'Stock' },
    ].filter(stock => 
      stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
      stock.name.toLowerCase().includes(query.toLowerCase())
    ).slice(0, limit);

    // حفظ في الكاش (10 دقائق)
    cache.set(cacheKey, egyptianStocks, 600000);

    res.json({
      success: true,
      data: egyptianStocks,
      cached: false,
      query,
      count: egyptianStocks.length,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('خطأ في البحث:', error);
    
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'بيانات غير صحيحة',
        details: error.errors,
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'خطأ في الخادم أثناء البحث',
    });
  }
};

/**
 * الحصول على بيانات أسهم متعددة
 * POST /api/market/quotes
 */
export const getMultipleQuotes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { symbols } = getMultipleQuotesSchema.parse(req.body);
    
    const results = await Promise.allSettled(
      symbols.map(async (symbol) => {
        // البحث في الكاش أولاً
        const cacheKey = `quote_${symbol.toUpperCase()}`;
        const cachedQuote = cache.get(cacheKey);
        
        if (cachedQuote) {
          return { symbol, data: cachedQuote, cached: true };
        }

        const quote = await yahooFinanceService.getQuote(symbol);
        if (quote) {
          // حفظ في الكاش
          cache.set(cacheKey, quote, 30000);
          return { symbol, data: quote, cached: false };
        }
        
        return { symbol, data: null, error: 'لم يتم العثور على السهم' };
      })
    );

    const quotes = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          symbol: symbols[index],
          data: null,
          error: 'خطأ في جلب البيانات',
        };
      }
    });

    res.json({
      success: true,
      data: quotes,
      count: quotes.length,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('خطأ في جلب الأسهم المتعددة:', error);
    
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'بيانات غير صحيحة',
        details: error.errors,
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'خطأ في الخادم أثناء جلب الأسهم المتعددة',
    });
  }
};

/**
 * الحصول على أكثر الأسهم تداولاً
 * GET /api/market/top-movers
 */
export const getTopMovers = async (req: Request, res: Response): Promise<void> => {
  try {
    const cacheKey = 'top_movers';
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      res.json({
        success: true,
        data: cachedData,
        cached: true,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // قائمة بأهم الأسهم المصرية
    const egxTopSymbols = [
      'CIB.CA', 'ETEL.CA', 'COMM.CA', 'COMI.CA', 'PHDC.CA',
      'HRHO.CA', 'SWDY.CA', 'MNHD.CA', 'TMGH.CA', 'OCDI.CA',
      'EAST.CA', 'EFGD.CA', 'ABUK.CA', 'ORAS.CA', 'SKPC.CA'
    ];

    const quotes = await Promise.allSettled(
      egxTopSymbols.map(symbol => yahooFinanceService.getQuote(symbol))
    );

    const validQuotes = quotes
      .map((result) => {
        if (result.status === 'fulfilled' && result.value) {
          return result.value;
        }
        return null;
      })
      .filter(quote => quote !== null)
      .sort((a, b) => Math.abs(b.priceChangePercent || 0) - Math.abs(a.priceChangePercent || 0))
      .slice(0, 10);

    const topMovers = {
      gainers: validQuotes
        .filter(quote => (quote.priceChangePercent || 0) > 0)
        .slice(0, 5),
      losers: validQuotes
        .filter(quote => (quote.priceChangePercent || 0) < 0)
        .slice(0, 5),
      mostActive: validQuotes
        .sort((a, b) => (b.volume || 0) - (a.volume || 0))
        .slice(0, 5),
    };

    // حفظ في الكاش (5 دقائق)
    cache.set(cacheKey, topMovers, 300000);

    res.json({
      success: true,
      data: topMovers,
      cached: false,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('خطأ في جلب أكثر الأسهم تداولاً:', error);

    res.status(500).json({
      success: false,
      error: 'خطأ في الخادم أثناء جلب أكثر الأسهم تداولاً',
    });
  }
};

/**
 * الحصول على حالة السوق
 * GET /api/market/status
 */
export const getMarketStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const cairoTime = new Date(now.toLocaleString("en-US", { timeZone: "Africa/Cairo" }));
    
    const currentHour = cairoTime.getHours();
    const currentMinute = cairoTime.getMinutes();
    const currentDay = cairoTime.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // أيام التداول: الأحد إلى الخميس (0-4)
    const isTradingDay = currentDay >= 0 && currentDay <= 4;
    
    // ساعات التداول: 10:00 إلى 14:30
    const isMarketHours = 
      (currentHour > 10 || (currentHour === 10 && currentMinute >= 0)) &&
      (currentHour < 14 || (currentHour === 14 && currentMinute <= 30));
    
    const isOpen = isTradingDay && isMarketHours;
    
    // حساب وقت الفتح/الإغلاق التالي
    let nextOpen, nextClose;
    
    if (isOpen) {
      // السوق مفتوح، حساب وقت الإغلاق
      nextClose = new Date(cairoTime);
      nextClose.setHours(14, 30, 0, 0);
    } else {
      // السوق مغلق، حساب وقت الفتح التالي
      nextOpen = new Date(cairoTime);
      
      if (!isTradingDay) {
        // إذا كان يوم الجمعة أو السبت، انتقل للأحد
        const daysUntilSunday = (7 - currentDay) % 7 || 7;
        nextOpen.setDate(nextOpen.getDate() + daysUntilSunday);
      } else if (currentHour >= 14 && currentMinute > 30) {
        // بعد ساعات التداول، انتقل لليوم التالي
        nextOpen.setDate(nextOpen.getDate() + 1);
      }
      
      nextOpen.setHours(10, 0, 0, 0);
    }
    
    const status = {
      isOpen,
      isTradingDay,
      currentTime: cairoTime.toISOString(),
      timezone: 'Africa/Cairo',
      nextOpen: nextOpen?.toISOString(),
      nextClose: nextClose?.toISOString(),
      tradingHours: {
        open: '10:00',
        close: '14:30',
        days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
      },
    };

    res.json({
      success: true,
      data: status,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('خطأ في جلب حالة السوق:', error);

    res.status(500).json({
      success: false,
      error: 'خطأ في الخادم أثناء جلب حالة السوق',
    });
  }
};
