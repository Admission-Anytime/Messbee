const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerSales
} = require('../controllers/customerController');

router.use(protect);

router.route('/')
  .get(getCustomers)
  .post(createCustomer);

router.route('/:id')
  .get(getCustomer)
  .put(updateCustomer)
  .delete(deleteCustomer);

router.route('/:id/sales')
  .get(getCustomerSales);

module.exports = router;
