const express = require('express');
const nidController = require('../controllers/nid.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { uploadNidDocs } = require('../middleware/upload');

const router = express.Router();

// User endpoints
router.post(
  '/',
  authenticate,
  uploadNidDocs.fields([
    { name: 'front_image', maxCount: 1 },
    { name: 'back_image', maxCount: 1 },
    { name: 'selfie', maxCount: 1 },
  ]),
  nidController.submitNid
);

router.get('/me', authenticate, nidController.getMyNid);

// Admin endpoints
router.get('/admin', authenticate, authorize('admin'), nidController.adminGetNidList);
router.get('/admin/:id', authenticate, authorize('admin'), nidController.adminGetNidById);
router.patch('/admin/:id/review', authenticate, authorize('admin'), nidController.adminReviewNid);

module.exports = router;
