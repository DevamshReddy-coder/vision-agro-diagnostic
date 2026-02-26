const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const { createTerminus } = require('@godaddy/terminus'); // For graceful shutdown
const http = require('http');
require('dotenv').config();

const app = express();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Security & Optimization Middlewares
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors());
app.use(morgan('combined')); // Production logging
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Standard Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Database Connection with Retry Logic
const connectDB = async () => {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/agrovision_enterprise';
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB Cluster');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err);
    setTimeout(connectDB, 5000);
  }
};
connectDB();

// API Versioning & Routes
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/diagnose', require('./routes/diagnoseRoutes'));
app.use('/api/v1/analytics', require('./routes/analyticsRoutes'));

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

// Global Error Handler (Production Ready)
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Graceful Shutdown Implementation
createTerminus(server, {
  healthChecks: { '/health': () => Promise.resolve() },
  onSignal: async () => {
    console.log('Server is shutting down...');
    await mongoose.connection.close();
  }
});

server.listen(PORT, () => {
  console.log(`🚀 AgroVision Engine v2.0 running on port ${PORT}`);
});
