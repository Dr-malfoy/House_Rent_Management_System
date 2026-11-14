const express = require('express');
const billingController = require('../controllers/billing.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

const router = express.Router();

router.post('/', authenticate, authorize('house_holder', 'admin'), billingController.createBillingEntry);
router.get('/', authenticate, billingController.getBillingList);
router.patch('/:id/pay', authenticate, authorize('house_holder', 'admin'), billingController.recordPayment);
router.get('/summary', authenticate, billingController.getBillingSummary);

module.exports = router;
