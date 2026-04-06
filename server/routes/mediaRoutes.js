const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// All media routes are protected
router.use(protect);

router.get('/', mediaController.getMedia);
router.post('/', upload.single('file'), mediaController.uploadMedia);
router.delete('/:id', mediaController.deleteMedia);
router.post('/bulk-delete', mediaController.bulkDeleteMedia);

module.exports = router;
