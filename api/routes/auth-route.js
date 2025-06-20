import express from "express";
import {  register,verifyEmail,login,getUserById,loginAdmin,deleteAccount} from "../controllers/auth-controller.js";
import { verifyToken } from "../middlewares/jwtVerify.js";
const router = express.Router()

router.post('/register', register);
router.post('/login', login);
router.post('/admin', loginAdmin);
router.get('/verify/:token', verifyEmail);
router.get('/get-user/:id',getUserById);
router.delete('/delete-account', verifyToken, deleteAccount);

export default router;