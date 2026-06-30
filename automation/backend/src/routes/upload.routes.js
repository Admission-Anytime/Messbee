import express from 'express';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import path from 'path';
import fs from 'fs';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

let upload;

// Check if S3 environment variables are provided
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_S3_BUCKET_NAME) {
  const s3 = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });

  upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: process.env.AWS_S3_BUCKET_NAME,
      metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname });
      },
      key: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `uploads/${req.user.tenantId}/${uniqueSuffix}${path.extname(file.originalname)}`);
      }
    }),
    limits: { fileSize: 20 * 1024 * 1024 } // 20 MB max
  });
  console.log('S3 Upload configured.');
} else {
  console.warn('AWS S3 credentials not found in environment. Falling back to local uploads (NOT for production).');
  const uploadDir = 'uploads/';
  if (!fs.existsSync(uploadDir)){
      fs.mkdirSync(uploadDir);
  }
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  });

  upload = multer({ 
    storage: storage,
    limits: { fileSize: 20 * 1024 * 1024 } 
  });
}

// Upload endpoint protected by auth
router.post('/', requireAuth, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    let fileUrl;
    if (req.file.location) {
      // S3 upload provides the location
      fileUrl = req.file.location;
    } else {
      // Local upload fallback
      // In production without S3, you should use an env var for BASE_URL
      const port = process.env.PORT || 5000;
      const baseUrl = process.env.BASE_URL || `http://localhost:${port}`;
      fileUrl = `${baseUrl}/uploads/${req.file.filename}`;
    }
    
    res.status(200).json({ 
      message: 'File uploaded successfully', 
      url: fileUrl,
      filename: req.file.key || req.file.filename
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to upload file', error: error.message });
  }
});

export default router;
