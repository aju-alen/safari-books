import express from "express";
import { verifyToken } from "../middlewares/jwtVerify.js";
import { createLibrary, updateLibraryStatus, getLibraryStatus, getLibraryByStatus } from "../controllers/library-controller.js";

const router = express.Router()

router.post('/create-library/:bookId', verifyToken, createLibrary);
router.put('/update-status/:bookId', verifyToken, updateLibraryStatus);
router.get('/status/:bookId', verifyToken, getLibraryStatus);
router.get('/books/:status', verifyToken, getLibraryByStatus);

export default router;