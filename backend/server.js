const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const config = require('./src/config/env');
const errorHandler = require('./src/middleware/errorHandler');
const { apiLimiter } = require('./src/middleware/rateLimiter');
const { authenticate } = require('./src/middleware/auth');
const housesController = require('./src/controllers/houses.controller');
const adminController = require('./src/controllers/admin.controller');

// Import Route Modules
const authRoutes = require('./src/routes/auth.routes');
const nidRoutes = require('./src/routes/nid.routes');
const housesRoutes = require('./src/routes/houses.routes');
const searchRoutes = require('./src/routes/search.routes');
const bookingsRoutes = require('./src/routes/bookings.routes');
const favoritesRoutes = require('./src/routes/favorites.routes');
const inquiriesRoutes = require('./src/routes/inquiries.routes');
const agreementsRoutes = require('./src/routes/agreements.routes');
const billingRoutes = require('./src/routes/billing.routes');
const feedbackRoutes = require('./src/routes/feedback.routes');
const notificationsRoutes = require('./src/routes/notifications.routes');
const locationsRoutes = require('./src/routes/locations.routes');
const geocodeRoutes = require('./src/routes/geocode.routes');
const adminRoutes = require('./src/routes/admin.routes');

const app = express();

// 1. Security & Logging Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow frontend to display uploaded images
  })
);

app.use(
  cors({
    origin: [config.cors.origin, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 2. Static File Serving (Uploaded Images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 3. Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Smart House Rent Management System REST API',
    version: '1.0.0',
  });
});

// 4. Mount API Routes under /api/v1
const apiV1 = express.Router();
apiV1.use(apiLimiter);

apiV1.use('/auth', authRoutes);
apiV1.use('/nid', nidRoutes);
apiV1.use('/houses', housesRoutes);
apiV1.use('/listings', housesRoutes); // Alias for legacy/prompts compatibility
apiV1.use('/search', searchRoutes);
apiV1.use('/map', searchRoutes); // Alias for map nearby queries
apiV1.use('/bookings', bookingsRoutes);
apiV1.use('/favorites', favoritesRoutes);
apiV1.use('/inquiries', inquiriesRoutes);
apiV1.use('/agreements', agreementsRoutes);
apiV1.use('/billing', billingRoutes);
apiV1.use('/feedback', feedbackRoutes);
apiV1.use('/notifications', notificationsRoutes);
apiV1.use('/locations', locationsRoutes);
apiV1.use('/geocode', geocodeRoutes);
apiV1.use('/admin', adminRoutes);

// Public convenient lookup endpoint
apiV1.get('/lookups', adminController.getLookups);

// Direct convenient endpoints for dashboards
apiV1.get('/me/houses', authenticate, housesController.getMyHouses);
apiV1.get('/landlord/listings', authenticate, housesController.getMyHouses);

app.use('/api/v1', apiV1);

// 5. 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
    data: null,
    errors: ['Endpoint not found'],
  });
});

// 6. Centralized Error Handler
app.use(errorHandler);

// Start server (only if not required as a test module)
if (process.env.NODE_ENV !== 'test') {
  const PORT = config.port;
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(` Smart House Rent REST API v1`);
    console.log(` Running on: http://localhost:${PORT}`);
    console.log(` Environment: ${config.nodeEnv}`);
    console.log(` Static Uploads: http://localhost:${PORT}/uploads/`);
    console.log(`=======================================================`);
  });
}

module.exports = app;
