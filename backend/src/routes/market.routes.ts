import { Router, Request, Response } from 'express';
import { historicalDataService } from '../services/historical-data.service';
import { yahooFinanceService } from '../services/yahoo-finance.service';

const router = Router();

/**
 * GET /api/market/historical/:symbol
 * جلب البيانات التاريخية لسهم معين
 */
router.get('/historical/:symbol', async (req: Request, res: Response): Promise<void> => {
  try {
    const { symbol } = req.params;
    const { period = '1y', source = 'db' } = req.query;
    
    if (!symbol) {
      res.status(400).json({
        success: false,
        error: 'رمز السهم مطلوب',
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    let historicalData;
    
    if (source === 'db') {
      // جلب من قاعدة البيانات
      const days = period === '2y' ? 730 : 365;
      historicalData = await historicalDataService.getHistoricalDataFromDB(symbol, days);
    } else {
      // جلب مباشر من Yahoo Finance
      historicalData = await yahooFinanceService.getHistoricalData(symbol, period as any);
    }

    res.json({
      success: true,
      data: {
        symbol,
        period,
        source,
        count: historicalData.length,
        data: historicalData
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('خطأ في جلب البيانات التاريخية:', error);
    res.status(500).json({
      success: false,
      error: 'فشل في جلب البيانات التاريخية',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/market/quote/:symbol
 * جلب السعر الحالي لسهم معين
 */
router.get('/quote/:symbol', async (req: Request, res: Response): Promise<void> => {
  try {
    const { symbol } = req.params;
    
    if (!symbol) {
      res.status(400).json({
        success: false,
        error: 'رمز السهم مطلوب',
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    const quote = await yahooFinanceService.getQuote(symbol);
    
    if (!quote) {
      res.status(404).json({
        success: false,
        error: 'السهم غير موجود أو غير متاح',
        timestamp: new Date().toISOString()
      });
      return;
    }

    res.json({
      success: true,
      data: quote,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('خطأ في جلب سعر السهم:', error);
    res.status(500).json({
      success: false,
      error: 'فشل في جلب سعر السهم',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/market/search
 * البحث عن الأسهم
 */
router.get('/search', async (req: Request, res: Response): Promise<void> => {
  try {
    const { q: query, limit = 10 } = req.query;
    
    if (!query || typeof query !== 'string') {
      res.status(400).json({
        success: false,
        error: 'يرجى إدخال نص للبحث',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const results = await yahooFinanceService.searchSymbols(query, Number(limit));

    res.json({
      success: true,
      data: {
        query,
        limit: Number(limit),
        count: results.length,
        results
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('خطأ في البحث عن الأسهم:', error);
    res.status(500).json({
      success: false,
      error: 'فشل في البحث عن الأسهم',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/market/top-movers
 * جلب الأسهم الأكثر حركة
 */
router.get('/top-movers', async (req: Request, res: Response) => {
  try {
    const topMovers = await yahooFinanceService.getTopMovers();

    res.json({
      success: true,
      data: topMovers,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('خطأ في جلب الأسهم الأكثر حركة:', error);
    res.status(500).json({
      success: false,
      error: 'فشل في جلب الأسهم الأكثر حركة',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/market/populate-data
 * جلب وحفظ البيانات التاريخية (للمطورين فقط)
 */
router.post('/populate-data', async (req: Request, res: Response): Promise<void> => {
  try {
    // التحقق من بيئة التطوير
    if (process.env.NODE_ENV !== 'development') {
      res.status(403).json({
        success: false,
        error: 'هذه الوظيفة متاحة فقط في بيئة التطوير',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const { period = '1y' } = req.body;
    
    // بدء عملية جلب البيانات في الخلفية
    historicalDataService.populateHistoricalData(period).catch(error => {
      console.error('خطأ في جلب البيانات التاريخية:', error);
    });

    res.json({
      success: true,
      message: 'بدء عملية جلب البيانات التاريخية في الخلفية',
      period,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('خطأ في تشغيل عملية جلب البيانات:', error);
    res.status(500).json({
      success: false,
      error: 'فشل في تشغيل عملية جلب البيانات',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/market/stats
 * احصائيات قاعدة البيانات
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await historicalDataService.getDataStats();

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('خطأ في جلب احصائيات البيانات:', error);
    res.status(500).json({
      success: false,
      error: 'فشل في جلب احصائيات البيانات',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/market/update-active
 * تحديث البيانات للأسهم النشطة
 */
router.post('/update-active', async (req: Request, res: Response) => {
  try {
    // بدء عملية التحديث في الخلفية
    historicalDataService.updateActiveStocks().catch(error => {
      console.error('خطأ في تحديث الأسهم النشطة:', error);
    });

    res.json({
      success: true,
      message: 'بدء عملية تحديث الأسهم النشطة',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('خطأ في تشغيل عملية التحديث:', error);
    res.status(500).json({
      success: false,
      error: 'فشل في تشغيل عملية التحديث',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
