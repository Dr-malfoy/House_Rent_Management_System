const express = require('express');
const locationsController = require('../controllers/locations.controller');

const router = express.Router();

router.get('/divisions', locationsController.getDivisions);
router.get('/districts', locationsController.getDistricts);
router.get('/areas', locationsController.getAreas);
router.get('/all', locationsController.getAllLocationsTree);

module.exports = router;
