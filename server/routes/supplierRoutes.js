const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getSupplierPurchases
} = require('../controllers/supplierController');

router.use(protect);

router.route('/')
  .get(getSuppliers)
  .post(createSupplier);

router.route('/:id')
  .get(getSupplier)
  .put(updateSupplier)
  .delete(deleteSupplier);

router.route('/:id/purchases')
  .get(getSupplierPurchases);

module.exports = router;
