import express from "express";
import { verifyToken } from "../middlewares/jwtVerify.js";
import {getAllPendingVerifications, getSinglePublisher, verifyPublisher, rejectPublisher, sendSampleAudio, generateFullAudio, getAdminAudioProgress} from "../controllers/admin-controller.js";
const router = express.Router()

router.get('/pending-verifications', verifyToken, getAllPendingVerifications);
router.get('/get-single/:isCompany/:id',verifyToken, getSinglePublisher);
router.post('/verify-publisher/:id',verifyToken, verifyPublisher);
router.post('/reject-publisher/:id', verifyToken, rejectPublisher);
router.post('/send-sample-audio/:id',verifyToken, sendSampleAudio);
router.post('/generate-full-audio/:id',verifyToken, generateFullAudio);
router.get('/audio-progress', verifyToken, getAdminAudioProgress);

export default router;