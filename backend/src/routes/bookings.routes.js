const express = require('express');
const bookingsController = require('../controllers/bookings.controller');
const { authenticate } = require('../middleware/auth');
const { requireNidVerified } = require('../middleware/authorize');

const router = express.Router();

router.post('/', authenticate, requireNidVerified, bookingsController.createBooking);
router.get('/my', authenticate, bookingsController.getMyBookings);
router.get('/house/:id', authenticate, bookingsController.getHouseBookers);
router.get('/:id/route', authenticate, bookingsController.getBookingRoute);
router.patch('/:id/status', authenticate, bookingsController.updateBookingStatus);

module.exports = router;
