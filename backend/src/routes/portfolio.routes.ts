import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import {
  getPortfolios,
  getPortfolioById,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
  addPosition,
  getTransactions,
  getPerformanceReport,
  deletePosition,
  syncPortfolio
} from '../controllers/portfolio.controller';

const router = Router();

/**
 * Portfolio Management Routes
 * جميع المسارات تتطلب المصادقة
 */

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * Portfolio CRUD Operations
 */

// Get all portfolios for user
router.get('/', getPortfolios);

// Get specific portfolio by ID
router.get('/:portfolioId', getPortfolioById);

// Create new portfolio
router.post('/', createPortfolio);

// Update portfolio
router.put('/:portfolioId', updatePortfolio);

// Delete portfolio
router.delete('/:portfolioId', deletePortfolio);

/**
 * Position Management
 */

// Add position to portfolio (buy/sell)
router.post('/:portfolioId/positions', addPosition);

// Delete position from portfolio
router.delete('/:portfolioId/positions/:positionId', deletePosition);

// Sync portfolio prices
router.post('/:portfolioId/sync', syncPortfolio);

/**
 * Transaction History
 */

// Get portfolio transactions
router.get('/:portfolioId/transactions', getTransactions);

/**
 * Analytics & Reports
 */

// Get portfolio performance report
router.get('/:portfolioId/performance', getPerformanceReport);

export default router;
