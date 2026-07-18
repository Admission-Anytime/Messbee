const express = require('express');
const { handleApiEventTrigger } = require('../controllers/webhook.controller.js');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Allow external API integrations to trigger flows
router.post('/event', handleApiEventTrigger);

module.exports = router;
