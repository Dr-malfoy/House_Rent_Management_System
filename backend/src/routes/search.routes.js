const express = require('express');
const searchController = require('../controllers/search.controller');

const router = express.Router();

router.get('/nearby', searchController.nearbySearch);
router.get('/directions', searchController.getDirections);

module.exports = router;
