import express from "express";
import {  register,verifyEmail,login,getUserById,loginAdmin} from "../controllers/auth-controller.js";
const router = express.Router()

router.post('/register', register);
router.post('/login', login);
router.post('/admin', loginAdmin);
router.get('/verify/:token', verifyEmail);
router.get('/get-user/:id',getUserById);

export default router;