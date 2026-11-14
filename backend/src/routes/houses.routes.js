const express = require('express');
const { body } = require('express-validator');
const housesController = require('../controllers/houses.controller');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { requireNidVerified } = require('../middleware/authorize');
const validate = require('../middleware/validate');
const geocodeMiddleware = require('../middleware/geocode.middleware');
const { uploadHouseImages } = require('../middleware/upload');

const router = express.Router();

// Public routes
router.get('/', housesController.getAllHouses);
router.get('/featured', housesController.getFeaturedHouses);
router.get('/ids', housesController.getHouseIds);
router.get('/my/listings', authenticate, housesController.getMyHouses);
router.get('/:id', optionalAuth, housesController.getHouseById);

// Protected routes (Create / Edit / Manage)
router.post(
  '/',
  authenticate,
  requireNidVerified,
  geocodeMiddleware,
  [
    body('title').trim().notEmpty().withMessage('House title is required'),
    body('address_text').trim().notEmpty().withMessage('Address is required'),
    body('area_name').trim().notEmpty().withMessage('Area name is required'),
    body('rent_amount').isNumeric().withMessage('Rent amount must be a number'),
    body('bedrooms').optional().isInt({ min: 1 }),
    body('bathrooms').optional().isInt({ min: 1 }),
  ],
  validate,
  housesController.createHouse
);

router.put('/:id', authenticate, geocodeMiddleware, housesController.updateHouse);
router.delete('/:id', authenticate, housesController.deleteHouse);
router.patch('/:id/deal-complete', authenticate, housesController.completeDeal);
router.patch('/:id/status', authenticate, housesController.updateHouseStatus);
router.post('/:id/images', authenticate, uploadHouseImages.array('images', 10), housesController.uploadImages);

module.exports = router;
