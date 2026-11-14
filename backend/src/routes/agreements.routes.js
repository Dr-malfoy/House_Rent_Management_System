const express = require('express');
const agreementsController = require('../controllers/agreements.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

const router = express.Router();

router.post('/', authenticate, authorize('house_holder', 'admin'), agreementsController.createAgreement);
router.get('/', authenticate, agreementsController.getAgreements);
router.patch('/:id/end', authenticate, agreementsController.endAgreement);

module.exports = router;
