import { Router } from 'express';
import marketDataRoutes from './market-data.routes';
import marketRoutes from './market.routes';
import authRoutes from './auth.routes';
import portfolioRoutes from './portfolio.routes';
// import alertRoutes from './alert.routes';

const router = Router();

/**
 * API Routes Configuration
 */

// Health Check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'EGX Pilot Advisor API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Market Data Routes
router.use('/market-data', marketDataRoutes);

// Enhanced Market Routes (New)
router.use('/market-enhanced', marketRoutes);

// Market Routes (Main)
router.use('/market', marketRoutes);

// Authentication Routes
router.use('/auth', authRoutes);

// Portfolio Management Routes
router.use('/portfolio', portfolioRoutes);

// Alerts & Notifications Routes (قريباً)
// router.use('/alerts', alertRoutes);

export default router;
