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
  approveUser
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.route('/')
  .get(protect, getUsers)
  .post(protect, createUser);

router.post('/bulk-delete', protect, bulkDeleteUsers);

router.get('/account-limits', protect, require('../controllers/userController').getAccountLimits);

// Admin approval routes (must be before /:id to avoid route conflicts)
router.get('/pending-approval', protect, getPendingUsers);
router.put('/:id/approve', protect, approveUser);

router.route('/profile')
  .get(protect, getProfile)
  .put(protect, updateProfile);

router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);

router.put('/subscription', protect, updateSubscription);

router.route('/:id')
  .put(protect, updateUser)
  .delete(protect, deleteUser);

module.exports = router;
