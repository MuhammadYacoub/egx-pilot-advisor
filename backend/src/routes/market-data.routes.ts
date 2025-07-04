import { Router } from 'express';
import * as marketDataController from '../controllers/market-data.controller';

const router = Router();

/**
 * @route   GET /api/market/quote/:symbol
 * @desc    الحصول على بيانات سهم واحد
 * @access  Public
 * @example GET /api/market/quote/CIB.CA
 */
router.get('/quote/:symbol', marketDataController.getQuote);

/**
 * @route   GET /api/market/historical/:symbol
 * @desc    الحصول على بيانات تاريخية لسهم
 * @access  Public
 * @query   period: 1d, 5d, 1mo, 3mo, 6mo, 1y, 2y (default: 1y)
 * @query   interval: 1d, 1wk, 1mo (default: 1d)
 * @example GET /api/market/historical/CIB.CA?period=6mo&interval=1d
 */
router.get('/historical/:symbol', marketDataController.getHistoricalData);

/**
 * @route   GET /api/market/search
 * @desc    البحث عن الأسهم
 * @access  Public
 * @query   query: نص البحث (مطلوب)
 * @query   limit: عدد النتائج (اختياري، افتراضي: 10، أقصى: 50)
 * @example GET /api/market/search?query=CIB&limit=5
 */
router.get('/search', marketDataController.searchSymbols);

/**
 * @route   POST /api/market/quotes
 * @desc    الحصول على بيانات أسهم متعددة
 * @access  Public
 * @body    { symbols: ['CIB.CA', 'ETEL.CA', 'COMM.CA'] }
 * @example POST /api/market/quotes
 */
router.post('/quotes', marketDataController.getMultipleQuotes);

/**
 * @route   GET /api/market/top-movers
 * @desc    الحصول على أكثر الأسهم تداولاً (الأعلى صعوداً، الأعلى هبوطاً، الأكثر نشاطاً)
 * @access  Public
 * @example GET /api/market/top-movers
 */
router.get('/top-movers', marketDataController.getTopMovers);

/**
 * @route   GET /api/market/status
 * @desc    الحصول على حالة السوق (مفتوح/مغلق، أوقات التداول)
 * @access  Public
 * @example GET /api/market/status
 */
router.get('/status', marketDataController.getMarketStatus);

export default router;
