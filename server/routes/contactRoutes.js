const express  = require('express');
const router   = express.Router();
const { protect } = require('../middleware/auth');
const upload   = require('../middleware/upload');
const {
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
  bulkDelete,
  bulkUpdateStatus,
  bulkAddLabels,
  importContacts,
} = require('../controllers/contactControllers');

// All routes require authentication
router.use(protect);

// ── Collection routes ─────────────────────────────────────────────────────────
router.route('/')
  .get(getContacts)      // GET  /api/contacts?page=1&limit=10&status=ACTIVE&search=john&labels=Hot+lead
  .post(createContact);  // POST /api/contacts

// ── Bulk action routes (must come BEFORE /:id) ───────────────────────────────
router.delete('/bulk-delete', bulkDelete); // DELETE /api/contacts/bulk-delete
router.put('/bulk-status',    bulkUpdateStatus);
router.put('/bulk-labels',    bulkAddLabels);

// ── CSV import ────────────────────────────────────────────────────────────────
router.post('/import', upload.single('file'), importContacts); // POST /api/contacts/import

// ── Single contact routes ─────────────────────────────────────────────────────
router.route('/:id')
  .get(getContact)        // GET    /api/contacts/:id
  .put(updateContact)     // PUT    /api/contacts/:id
  .delete(deleteContact); // DELETE /api/contacts/:id

module.exports = router;

