const express = require('express');
const {
  getInventoryItems,
  getInventorySummary,
  verifyInventoryMetaConnection,
  initializeInventoryCommerceSettings,
  getInventoryItemById,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} = require('../controllers/inventoryController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/summary', getInventorySummary);
router.get('/meta-verification', verifyInventoryMetaConnection);
router.post('/meta-verification/init-commerce', initializeInventoryCommerceSettings);
router.get('/', getInventoryItems);
router.post('/', createInventoryItem);
router.get('/:id', getInventoryItemById);
router.put('/:id', updateInventoryItem);
router.delete('/:id', deleteInventoryItem);

module.exports = router;
