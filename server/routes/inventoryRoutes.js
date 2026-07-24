const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getInventoryLogs,
  getLowStockAlerts,
  getOutofStock,
  adjustStock
} = require('../controllers/inventoryController');

router.use(protect);

router.get('/logs', getInventoryLogs);
router.get('/low-stock', getLowStockAlerts);
router.get('/out-of-stock', getOutofStock);
router.post('/adjust', adjustStock);

module.exports = router;
