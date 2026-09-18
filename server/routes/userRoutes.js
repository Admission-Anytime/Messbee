const express = require('express');
const {
  getProfile,
  updateProfile,
  uploadAvatar,
  updateSubscription,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  bulkDeleteUsers,
  getPendingUsers,
  approveUser,
  contactSales,
  getSalesInquiries,
  getUserPricing,
  updateUserPricing,
  resetUserPricing
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.route('/')
  .get(protect, getUsers)
  .post(protect, createUser);

router.post('/bulk-delete', protect, bulkDeleteUsers);

router.route('/contact-sales')
  .post(protect, contactSales)
  .get(protect, getSalesInquiries);

router.get('/account-limits', protect, require('../controllers/userController').getAccountLimits);

// Admin approval routes (must be before /:id to avoid route conflicts)
router.get('/pending-approval', protect, getPendingUsers);
router.put('/:id/approve', protect, approveUser);

// Dynamic Client-Specific WhatsApp Pricing (Super Admin / Admin)
router.route('/:id/pricing')
  .get(protect, authorize('ADMIN', 'admin'), getUserPricing)
  .post(protect, authorize('ADMIN', 'admin'), updateUserPricing)
  .put(protect, authorize('ADMIN', 'admin'), updateUserPricing)
  .delete(protect, authorize('ADMIN', 'admin'), resetUserPricing);

router.route('/profile')
  .get(protect, getProfile)
  .put(protect, updateProfile);

router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);

router.put('/subscription', protect, updateSubscription);

router.route('/:id')
  .put(protect, updateUser)
  .delete(protect, deleteUser);

module.exports = router;
