const express = require('express');
const favoritesController = require('../controllers/favorites.controller');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, favoritesController.getFavorites);
router.post('/:houseId', authenticate, favoritesController.addFavorite);
router.delete('/:houseId', authenticate, favoritesController.removeFavorite);

module.exports = router;
