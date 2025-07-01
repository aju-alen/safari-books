import express from "express";
import { verifyToken } from "../middlewares/jwtVerify.js";
import {
    getAllBooksData,
    getSingleBookData,
    getAllBooksDataByCategory,
    getFeaturedBooks,
} from '../controllers/listener-controller.js'

const router = express.Router()

router.get('/books-data', getAllBooksData);
router.get('/book-data/:id', getSingleBookData);
router.get('/get-all-books-data/:category', getAllBooksDataByCategory);
router.get('/featured-books', getFeaturedBooks);

export default router;