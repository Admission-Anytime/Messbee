const express = require('express');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  verifyProductMetaConnection,
  initializeProductCommerceSettings,
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/meta-verification', verifyProductMetaConnection);
router.post('/meta-verification/init-commerce', initializeProductCommerceSettings);
router.get('/', getProducts);
router.post('/', createProduct);
router.get('/:id', getProductById);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;
