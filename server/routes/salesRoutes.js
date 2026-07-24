const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getSales,
  getSale,
  createSale
} = require('../controllers/salesController');

router.use(protect);

router.route('/')
  .get(getSales)
  .post(createSale);

router.route('/:id')
  .get(getSale);

module.exports = router;
