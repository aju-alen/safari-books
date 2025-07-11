import express from "express";
import { verifyToken } from "../middlewares/jwtVerify.js";
import {
    getAllBooksData,
    getSingleBookData,
    getAllBooksDataByCategory,
    getFeaturedBooks,
    bookmarkBook,
    listenerAnalytics,
    getBookRecommendations,
    getAllBooksDataByRecent,
} from '../controllers/listener-controller.js'

const router = express.Router()

router.get('/books-data', getAllBooksData);
router.get('/book-data/:id', getSingleBookData);
router.get('/book-recommendations/:id', getBookRecommendations);
router.get('/listener-analytics', verifyToken, listenerAnalytics);
router.get('/get-all-books/recent', getAllBooksDataByRecent);
router.get('/get-all-books-data/:category', getAllBooksDataByCategory);
router.get('/featured-books', getFeaturedBooks);
router.put('/bookmark/:bookId', verifyToken, bookmarkBook);

export default router;