import express from "express";
import { verifyToken } from "../middlewares/jwtVerify.js";
import {getAllPendingVerifications, getSinglePublisher, verifyPublisher} from "../controllers/admin-controller.js";
const router = express.Router()

router.get('/pending-verifications', verifyToken, getAllPendingVerifications);
router.get('/get-single/:isCompany/:id',verifyToken, getSinglePublisher);
router.post('/verify-publisher/:id',verifyToken, verifyPublisher);

export default router;