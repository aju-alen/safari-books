import crypto from "crypto";
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt';
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import { backendUrl } from "../utils/backendUrl.js";
import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();

export const publisherCompany = async (req, res) => {
    console.log(req.body);
    try {
        const createCompany = await prisma.company.create({
            data: {
                id: req.body.id,
                companyName: req.body.companyName,
                address: req.body.address,
                telephone: req.body.telephone,
                companyRegNo: req.body.companyRegNo,
                kraPin: req.body.kraPin,
                companyRegNoPdfUrl: req.body.companyRegNoPdfUrl,
                kraPinPdfUrl: req.body.kraPinPdfUrl,
                userId: req.body.userId
            }
        });
        await prisma.$disconnect();
        res.status(201).json({ message: "Company registered successfully", createCompany });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", error });

    }
};

export const publisherCompanyUpdate = async (req, res) => {
    try {
        const updateCompany = await prisma.company.update({
            where: {
                id: req.body.id,
            },
            data: {
                title:req.body.title,
                language:req.body.language,
                categories:req.body.categories,
                date:req.body.date,
                ISBNDOIISRC:req.body.ISBNDOIISRC,
                synopsis:req.body.synopsis,
                narrator:req.body.narrator,
                narrationStyleSlow:req.body.narrationStyleSlow,
                narrationStyleFast:req.body.narrationStyleFast,
                narrationStyleIntimate:req.body.narrationStyleIntimate,
                narrationStyleCasual:req.body.narrationStyleCasual,
                narrationStyleStatic:req.body.narrationStyleStatic,
                narrationStyleOratoric:req.body.narrationStyleOratoric,
                audioSampleURL:req.body.audioSampleURL,
                pdfURL:req.body.pdfURL,
                rightsHolder:req.body.rightsHolder,
            }
        });
        await prisma.$disconnect();
        res.status(204).json({ message: "Company updated successfully", updateCompany });

    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", error });

    }
}
