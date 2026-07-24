const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getDashboardStats,
  getSalesReport,
  getPurchaseReport
} = require('../controllers/reportsController');

router.use(protect);

router.get('/dashboard', getDashboardStats);
router.get('/sales', getSalesReport);
router.get('/purchases', getPurchaseReport);

module.exports = router;
