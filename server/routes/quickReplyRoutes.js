const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { 
    getQuickReplies, 
    createQuickReply, 
    deleteQuickReply, 
    updateQuickReply 
} = require('../controllers/quickReplyController');

// ✅ Automatic Folder Creation (ENOENT fix)
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 16 * 1024 * 1024 } 
});

const { protect } = require('../middleware/auth');

// Protect all quick reply routes
router.use(protect);

router.get('/', getQuickReplies);
router.post('/', upload.single('file'), createQuickReply);
router.put('/:id', upload.single('file'), updateQuickReply);
router.delete('/:id', deleteQuickReply);

module.exports = router;