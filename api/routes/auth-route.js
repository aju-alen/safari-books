import express from "express";
import {  register,verifyEmail,login,getUserById} from "../controllers/auth-controller.js";
const router = express.Router()

router.post('/register', register);
router.post('/login', login);
router.get('/verify/:token', verifyEmail);
router.get('/get-user/:id',getUserById);

export default router;