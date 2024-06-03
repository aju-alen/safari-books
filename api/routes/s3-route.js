import express from "express";
const router = express.Router()
import { postProfileImageS3 } from '../controllers/s3-controller.js';
import multer from 'multer';
  // Configure multer for file upload
  const upload = multer();


router.post('/upload-to-aws', upload.single('document'), postProfileImageS3);

export default router;