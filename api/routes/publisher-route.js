import express from "express";
const router = express.Router()
import {publisherCompany,publisherCompanyUpdate,publisherAuthor} from '../controllers/publisher-controller.js';

router.post('/create-company', publisherCompany);
router.post('/create-author',publisherAuthor)
router.put('/update-company', publisherCompanyUpdate);

export default router;