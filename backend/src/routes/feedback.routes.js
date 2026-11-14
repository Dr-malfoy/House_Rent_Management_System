const express = require('express');
const feedbackController = require('../controllers/feedback.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

const router = express.Router();

// User submit
router.post('/', authenticate, feedbackController.submitFeedback);

// Admin review & respond
router.get('/admin', authenticate, authorize('admin'), feedbackController.getAdminFeedback);
router.post('/admin/:id/respond', authenticate, authorize('admin'), feedbackController.respondToFeedback);

module.exports = router;
