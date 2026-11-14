const express = require('express');
const notificationsController = require('../controllers/notifications.controller');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, notificationsController.getMyNotifications);
router.patch('/:id/read', authenticate, notificationsController.markAsRead);
router.patch('/read-all', authenticate, notificationsController.markAllAsRead);

module.exports = router;
