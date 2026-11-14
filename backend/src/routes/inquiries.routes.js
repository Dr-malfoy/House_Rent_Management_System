const express = require('express');
const inquiriesController = require('../controllers/inquiries.controller');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, inquiriesController.getInquiries);
router.post('/house/:id', authenticate, inquiriesController.createInquiry);
router.patch('/:id/status', authenticate, inquiriesController.updateInquiryStatus);

module.exports = router;
