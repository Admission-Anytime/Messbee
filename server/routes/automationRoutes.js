const express = require('express');
const {
  getAutomations,
  getAutomation,
  createAutomation,
  updateAutomation,
  deleteAutomation,
  toggleAutomation
} = require('../controllers/automationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All routes require authentication

router.route('/')
  .get(getAutomations)
  .post(createAutomation);

router.route('/:id')
  .get(getAutomation)
  .put(updateAutomation)
  .delete(deleteAutomation);

router.put('/:id/toggle', toggleAutomation);

module.exports = router;
