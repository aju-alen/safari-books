import express from "express";
const router = express.Router()
import { postProfileImageS3,postAudioS3} from '../controllers/s3-controller.js';
import multer from 'multer';
  // Configure multer for file upload
  const upload = multer();


router.post('/upload-to-aws', upload.fields([
  { name: 'document1', maxCount: 1 },
  { name: 'document2', maxCount: 1 },
  { name: 'document3', maxCount: 1 }
]), postProfileImageS3);

router.post('/upload-to-aws-audio', upload.single('audio1'), postAudioS3);

export default router;