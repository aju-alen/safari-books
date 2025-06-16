import express from "express";
import { verifyToken } from "../middlewares/jwtVerify.js";
import {getAllBooksData,getSingleBookData} from '../controllers/listener-controller.js'

const router = express.Router()

router.get('/books-data', getAllBooksData);
router.get('/book-data/:id', getSingleBookData);

export default router;