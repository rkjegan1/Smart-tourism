require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const placeRoutes = require('./routes/placeRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Initialize database connection if executed directly
if (require.main === module) {
  connectDB();
}

const app = express();

// Trust reverse proxy (AWS Elastic Beanstalk Nginx / CloudFront)
app.set('trust proxy', 1);

// Configure CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim())
  : '*';

app.use(
  cors({
    origin: allowedOrigins === '*' ? '*' : allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());

// Cloud Health Check endpoint (used by AWS Elastic Beanstalk, ALB, and CloudWatch synthetics)
const healthHandler = (req, res) => {
  const dbStatus = connectDB.getDbStatus();
  const isStrict = req.query.strict === 'true';
  const isHealthy = dbStatus.connected;

  const healthData = {
    status: isHealthy ? 'healthy' : 'degraded',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    service: 'smart-tourism-api',
    environment: process.env.NODE_ENV || 'development',
    database: dbStatus,
    version: '1.0.0',
  };

  // In cloud PaaS (Beanstalk/EC2), return 200 so process is not prematurely terminated during DB retries
  const httpStatus = isStrict && !isHealthy ? 503 : 200;
  res.status(httpStatus).json(healthData);
};

app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

app.get('/', (req, res) => {
  res.json({
    message: 'Smart Tourism API is running',
    version: '1.0.0',
    documentation: '/api/places, /api/recommend, /api/auth',
    health: '/health',
  });
});

// Application Routes
app.use('/api/auth', authRoutes);
app.use('/api/places', placeRoutes);
app.use('/api/recommend', recommendationRoutes);
app.use('/api/admin', adminRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

let server;
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  server = app.listen(PORT, () => {
    console.log(`🚀 [Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });

  // Graceful shutdown for AWS EC2 / Beanstalk lifecycle events
  const gracefulShutdown = (signal) => {
    console.log(`🛑 [Server] Received ${signal}. Starting graceful shutdown...`);
    if (server) {
      server.close(() => {
        console.log('✅ [Server] HTTP server closed.');
        process.exit(0);
      });
    }

    setTimeout(() => {
      console.error('⚠️ [Server] Forcefully shutting down after timeout.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

module.exports = app;
