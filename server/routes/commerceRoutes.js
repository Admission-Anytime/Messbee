const express = require('express');
const router = express.Router();
const {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getPayments,
  createPayment
} = require('../controllers/commerceController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/products')
  .get(getProducts)
  .post(createProduct);

router.route('/products/:id')
  .put(updateProduct)
  .delete(deleteProduct);

router.route('/payments')
  .get(getPayments)
  .post(createPayment);

module.exports = router;
