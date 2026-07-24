const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

router.use(protect);

router.route('/')
  .get(getProducts)
  .post(createProduct);

router.route('/:id')
  .get(getProduct)
  .put(updateProduct)
  .delete(deleteProduct);

module.exports = router;
