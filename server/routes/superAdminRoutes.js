const express = require('express');
const router = express.Router();
const {
  verifySuperAdminKey,
  updateApprovalStatus,
  getPendingApprovals,
  getMyApprovalStatus
} = require('../controllers/superAdminController');
const { protect } = require('../middleware/auth');

// Super Admin External Endpoints (API Key secured)
router.post('/approvals/status', verifySuperAdminKey, updateApprovalStatus);
router.get('/approvals/pending', verifySuperAdminKey, getPendingApprovals);

// User-facing status check
router.get('/my-approval-status', protect, getMyApprovalStatus);

module.exports = router;

