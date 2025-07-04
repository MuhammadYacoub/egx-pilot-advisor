import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

import { config } from './config';
import { prisma } from './config/database';
import { testEmailConnection } from './config/email';

// Import routes
import apiRoutes from './routes';

// Import services
import { cache } from './services/cache.service';
import { yahooFinanceService } from './services/yahoo-finance.service';

const app = express();
const httpServer = createServer(app);

// Socket.IO setup
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: config.frontend.corsOrigin,
    methods: ['GET', 'POST']
  },
  pingTimeout: config.websocket.pingTimeout,
  pingInterval: config.websocket.pingInterval
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(compression());

// Logging
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting - خفيف في بيئة التطوير
const limiter = rateLimit({
  windowMs: config.nodeEnv === 'development' ? 60000 : config.rateLimit.windowMs, // 1 minute in dev, 15 minutes in production
  max: config.nodeEnv === 'development' ? 1000 : config.rateLimit.max, // 1000 requests in dev, 100 in production
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil((config.nodeEnv === 'development' ? 60000 : config.rateLimit.windowMs) / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // تجاهل rate limiting للطلبات الداخلية في بيئة التطوير
    if (config.nodeEnv === 'development' && req.ip === '::1' || req.ip === '127.0.0.1') {
      return true;
    }
    return false;
  }
});

app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Check Yahoo Finance service
    const yahooStats = yahooFinanceService.getStats();
    
    // Check cache
    const cacheStats = cache.getStats();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: config.nodeEnv,
      services: {
        database: 'connected',
        yahooFinance: {
          status: 'active',
          requestsRemaining: yahooStats.rateLimitRemaining,
          cacheSize: yahooStats.cacheStats.size
        },
        cache: {
          status: 'active',
          size: cacheStats.size
        }
      }
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Service unavailable'
    });
  }
});

// API status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    message: 'EGX Pilot Advisor API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv
  });
});

// API Routes
app.use('/api', apiRoutes);

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log(`📱 Client connected: ${socket.id}`);

  // Handle market data subscription
  socket.on('subscribe-market-data', (symbols: string[]) => {
    console.log(`📊 Client ${socket.id} subscribed to:`, symbols);
    socket.join('market-data');
    
    // Send initial data
    // This will be implemented when market data service is ready
  });

  // Handle portfolio updates subscription
  socket.on('subscribe-portfolio', (portfolioId: string) => {
    console.log(`💼 Client ${socket.id} subscribed to portfolio:`, portfolioId);
    socket.join(`portfolio-${portfolioId}`);
  });

  // Handle alerts subscription
  socket.on('subscribe-alerts', (userId: string) => {
    console.log(`🚨 Client ${socket.id} subscribed to alerts for user:`, userId);
    socket.join(`alerts-${userId}`);
  });

  socket.on('disconnect', () => {
    console.log(`📱 Client disconnected: ${socket.id}`);
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Unhandled error:', err);
  
  res.status(err.status || 500).json({
    error: {
      message: config.nodeEnv === 'development' ? err.message : 'Internal Server Error',
      status: err.status || 500,
      ...(config.nodeEnv === 'development' && { stack: err.stack })
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      status: 404,
      path: req.originalUrl
    }
  });
});

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`📴 Received ${signal}. Starting graceful shutdown...`);
  
  // Close HTTP server
  httpServer.close(() => {
    console.log('🔌 HTTP server closed');
  });
  
  // Close Socket.IO server
  io.close(() => {
    console.log('🔌 Socket.IO server closed');
  });
  
  // Disconnect from database
  try {
    await prisma.$disconnect();
    console.log('🗄️ Database disconnected');
  } catch (error) {
    console.error('❌ Error disconnecting from database:', error);
  }
  
  // Clear cache
  cache.destroy();
  console.log('🧹 Cache cleared');
  
  console.log('✅ Graceful shutdown completed');
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Test email configuration
    const emailTestResult = await testEmailConnection();
    if (emailTestResult) {
      console.log('✅ Email service configured successfully');
    } else {
      console.warn('⚠️ Email service configuration issue');
    }
    
    // Start HTTP server
    httpServer.listen(config.port, () => {
      console.log('🚀 EGX Pilot Advisor Backend Server Started');
      console.log(`📍 Server running on port ${config.port}`);
      console.log(`🌍 Environment: ${config.nodeEnv}`);
      console.log(`🔗 Health check: http://localhost:${config.port}/health`);
      console.log(`📊 API status: http://localhost:${config.port}/api/status`);
      
      if (config.nodeEnv === 'development') {
        console.log(`🔧 Development mode: detailed logging enabled`);
      }
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

export { app, io };
