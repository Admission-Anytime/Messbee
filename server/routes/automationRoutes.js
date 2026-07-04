const express = require('express');
const {
  getAutomations,
  getAutomationById,
  createAutomation,
  updateAutomation,
  deleteAutomation,
  getActivityLog,
  testAutomation
} = require('../controllers/automationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protect all automation routes
router.use(protect);

router.route('/')
  .get(getAutomations)
  .post(createAutomation);

router.route('/activity')
  .get(getActivityLog);

router.post('/:id/test', testAutomation);

router.route('/:id')
  .get(getAutomationById)
  .put(updateAutomation)
  .delete(deleteAutomation);

module.exports = router;
