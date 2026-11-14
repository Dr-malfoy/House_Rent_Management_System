const express = require('express');
const geocodeController = require('../controllers/geocode.controller');

const router = express.Router();

router.get('/', geocodeController.geocodeAddress);
router.get('/reverse', geocodeController.reverseGeocodeCoords);

module.exports = router;
