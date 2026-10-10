const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const {
  notFound,
  errorHandler,
} = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ===============================
// Middlewares
// ===============================

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(
  express.urlencoded({
    extended: true,
    limit: '10mb',
  })
);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ===============================
// Health Check
// ===============================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system:
      'Smart Waste Collection and Recycling Management System API',
    timestamp: new Date().toISOString(),
  });
});

// ===============================
// Mount Routes
// ===============================

app.use(
  '/api/auth',
  require('./routes/authRoutes')
);

app.use(
  '/api/requests',
  require('./routes/requestRoutes')
);

app.use(
  '/api/complaints',
  require('./routes/complaintRoutes')
);

app.use(
  '/api/recycling',
  require('./routes/recyclingRoutes')
);

app.use(
  '/api/users',
  require('./routes/userRoutes')
);

app.use(
  '/api/categories',
  require('./routes/categoryRoutes')
);

app.use(
  '/api/notifications',
  require('./routes/notificationRoutes')
);

app.use(
  '/api/analytics',
  require('./routes/analyticsRoutes')
);

// ===============================
// Employee Collection Routes
// ===============================

app.use(
  '/api/collections',
  require('./routes/collectionRoutes')
);

// ===============================
// Chatbot Route
// ===============================

app.use(
  '/api/chat',
  require('./routes/chatRoutes')
);

// ===============================
// Root API Welcome
// ===============================

app.get('/', (req, res) => {
  res.json({
    message:
      'Welcome to Smart Waste Collection & Recycling Management API',
    version: '1.0.0',
    docs: '/api/health',
  });
});

// ===============================
// Error Handling
// ===============================

app.use(notFound);
app.use(errorHandler);

// ===============================
// Start Server
// ===============================

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(
    `[Smart Waste Server] Running on http://localhost:${PORT} in ${
      process.env.NODE_ENV || 'development'
    } mode`
  );
});

// ===============================
// Handle Unhandled Promise Rejections
// ===============================

process.on('unhandledRejection', (err) => {
  console.error(
    `[Unhandled Error] ${err.message}`
  );

  // Close server & exit process if fatal
});

module.exports = app;