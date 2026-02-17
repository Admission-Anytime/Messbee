const express = require("express");
const router = express.Router();
const {
  getStatuses,
  createStatus,
  updateStatus,
  deleteStatus,
} = require("../controllers/statusController");

// ✅ Import the middleware (Make sure path matches your folder structure)
const { protect } = require("../middleware/auth"); 

// ✅ VITAL: Add 'protect' to BOTH .get() and .post()
router.route("/")
  .get(protect, getStatuses)
  .post(protect, createStatus); // <--- Ensure 'protect' is here!

// ✅ VITAL: Add 'protect' to .put() and .delete()
router.route("/:id")
  .put(protect, updateStatus)
  .delete(protect, deleteStatus);

module.exports = router;