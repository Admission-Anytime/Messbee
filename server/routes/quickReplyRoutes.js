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

// ✅ Automatic Folder Creation (ENOENT fix) -  compatible
// In  serverless, use /tmp directory (only writable location)
const uploadDir = process.env.VERCEL 
    ? '/tmp/uploads' 
    : path.join(__dirname, '../uploads');

// Only create directory if not in  or if directory doesn't exist
if (!fs.existsSync(uploadDir)) {
    try {
        fs.mkdirSync(uploadDir, { recursive: true });
    } catch (err) {
        console.warn('Could not create upload directory:', err.message);
    }
}

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); 
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