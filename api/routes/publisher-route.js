import express from "express";
const router = express.Router()
import {publisherCompany,publisherCompanyUpdate,publisherAuthor,getAllAuthorData,getAllCompanyData,getSingleAuthorData,getSingleCompanyData,publishBook} from '../controllers/publisher-controller.js';

router.post('/create-company', publisherCompany);
router.post('/create-author',publisherAuthor)
router.post('/publish-book',publishBook)
router.put('/update-company', publisherCompanyUpdate);
router.get('/get-all-author-data/:userId',getAllAuthorData)
router.get('/get-all-author-data-single/:userId',getSingleAuthorData)

router.get('/get-all-company-data/:userId',getAllCompanyData)
router.get('/get-all-company-data-single/:userId',getSingleCompanyData)

export default router;