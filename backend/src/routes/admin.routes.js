const express = require('express');
const adminController = require('../controllers/admin.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

const router = express.Router();

// Public Read-Only Lookups (Property types and amenities needed for house filters and post forms)
router.get('/lookups', adminController.getLookups);

// All other admin routes require authentication and admin role
router.use(authenticate, authorize('admin'));

router.get('/stats', adminController.getStats);

// Users
router.get('/users', adminController.getUsersList);
router.get('/users/:id', adminController.getUserDetails);
router.patch('/users/:id/ban', adminController.banUser);
router.patch('/users/:id/unban', adminController.unbanUser);
router.patch('/users/:id/role', adminController.changeUserRole);

// Houses
router.get('/houses', adminController.getAdminHouses);
router.patch('/houses/:id/review', adminController.reviewHouse);
router.patch('/houses/:id/featured', adminController.toggleFeatured);

// Lookups Management (Amenities & Property Types)
router.post('/amenities', adminController.createAmenity);
router.delete('/amenities/:id', adminController.deleteAmenity);
router.post('/property-types', adminController.createPropertyType);
router.delete('/property-types/:id', adminController.deletePropertyType);

module.exports = router;
