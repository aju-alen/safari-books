import { PrismaClient } from '@prisma/client'

import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();

export const getAllBooksData = async (req,res)=>{

    try{
        const books = await prisma.book.findMany({
            where: {
                isPublished: true
            },
        });
        res.status(200).json({books});
    }
    catch(err){
        console.log(err,'error in listener-controller api');
        res.status(500).json({message: "Internal server error"});
    }
}

export const getSingleBookData = async (req,res)=>{
    const {id} = req.params;

    try{
        const book = await prisma.book.findUnique({
            where: {
                id: id
            },
        });
        if(!book){
            return res.status(404).json({message: "Book not found"});
        }
        res.status(200).json(book);
    }
    catch(err){
        console.log(err,'error in listener-controller api');
        res.status(500).json({message: "Internal server error"});
    }
}