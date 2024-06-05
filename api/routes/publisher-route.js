import express from "express";
const router = express.Router()
import {publisherCompany,publisherCompanyUpdate} from '../controllers/publisher-controller.js';

router.post('/create-company', publisherCompany);
router.put('/update-company', publisherCompanyUpdate);

export default router;