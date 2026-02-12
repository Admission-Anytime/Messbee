const express = require('express');
const {
  getProfile,
  updateProfile,
  uploadAvatar,
  updateSubscription
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(protect); // All routes require authentication

router.route('/profile')
  .get(getProfile)
  .put(updateProfile);

router.post('/avatar', upload.single('avatar'), uploadAvatar);
router.put('/subscription', updateSubscription);

module.exports = router;
