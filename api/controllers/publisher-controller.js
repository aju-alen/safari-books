
import { PrismaClient } from '@prisma/client'

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

export const publisherAuthor = async (req, res) => {
    try {
        const createAuthor = await prisma.author.create({
            data: {
                id: req.body.id,
                fullName: req.body.fullName,
                address: req.body.address,
                telephone: req.body.telephone,
                idppNo: req.body.idppNo,
                idppPdfUrl: req.body.idppPdfUrl,
                kraPin: req.body.kraPin,
                kraPinPdfUrl: req.body.kraPinPdfUrl,
                writersGuildNo: req.body.writersGuildNo,
                userId: req.body.userId
            }
        });
        await prisma.$disconnect();
        res.status(201).json({ message: "Author registered successfully", createAuthor });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", error });

    }
}

export const publisherCompanyUpdate = async (req, res) => {
    try {
        const findUnique = await prisma.company.findUnique({
            where: {
                id: req.body.id,
            }
        });
        if(findUnique){
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
                    coverImage:req.body.coverImage,
                    amount:req.body.amount * 100, 
                }
            });
        }
        else{
            const updateAuthor = await prisma.author.update({
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
                    coverImage:req.body.coverImage,
                    amount:req.body.amount * 100
                }
            });
        }
       
        await prisma.$disconnect();
        res.status(204).json({ message: "Company updated successfully"});

    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", error });

    }
}

export const getAllAuthorData = async (req, res) => {
    console.log(req.params.userId);
    
    try {
        const authorData = await prisma.author.findMany({
            where: {
                userId: req.params.userId,
            },
           select: {
            id: true,
            title: true,
            isVerified:true
           }
        });
        await prisma.$disconnect();
        res.status(200).json({ message: "All data fetched successfully", authorData });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", error });

    }

}

export const getSingleAuthorData = async (req, res) => {
    
    try {
        const authorData = await prisma.author.findUnique({
            where: {
                id: req.params.userId,
            }
        });
        await prisma.$disconnect();
        res.status(200).json({ message: "All data fetched successfully", authorData });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", error });

    }

}

export const getAllCompanyData = async (req, res) => {
    
    try {
        const companyData = await prisma.company.findMany({
            where: {
                userId: req.body.userId,
            }
        });
        await prisma.$disconnect();
        res.status(200).json({ message: "All data fetched successfully", companyData });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", error });

    }

}

export const getSingleCompanyData = async (req, res) => {
    
    try {
        const companyData = await prisma.company.findMany({
            where: {
                id: req.params.userId,
            }
        });
        await prisma.$disconnect();
        res.status(200).json({ message: "All data fetched successfully", companyData });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", error });

    }

}

export const publishBook = async (req, res) => {
    const {durationInHours,durationInMinutes,summary,releaseDate,rating,colorCode} = req.body;
    try {
        const publishBook = await prisma.book.create({
            data: {
                durationInHours,
                durationInMinutes,
                summary,
                releaseDate,
                rating,
                colorCode,
                
            }
        });
        await prisma.$disconnect();
        res.status(201).json({ message: "Book published successfully", publishBook });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", error });
    }
    
}

export const createPostmanBook = async (req, res) => {
    try {
        const createPostmanBook = await prisma.book.create({
            data: req.body
        });
        await prisma.$disconnect();
        res.status(201).json({ message: "Book created successfully", createPostmanBook });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", error });
    }
}