const express = require('express');
const { getSettings, updateSettings } = require('../controllers/settings.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getSettings);
router.put('/', protect, updateSettings);

module.exports = router;
