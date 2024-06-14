import express from "express";
const router = express.Router()
import {publisherCompany,publisherCompanyUpdate,publisherAuthor,getAllAuthorData,getAllCompanyData} from '../controllers/publisher-controller.js';

router.post('/create-company', publisherCompany);
router.post('/create-author',publisherAuthor)
router.put('/update-company', publisherCompanyUpdate);
router.get('/get-all-author-data/:userId',getAllAuthorData)
router.get('/get-all-company-data/:userId',getAllCompanyData)

export default router;