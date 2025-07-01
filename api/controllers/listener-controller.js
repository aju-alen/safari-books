import { PrismaClient } from '@prisma/client'

import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();

export const getAllBooksData = async (req,res)=>{
    const { page = 1, limit = 7 } = req.query;
    const offset = (page - 1) * limit;
    
    try{
        const books = await prisma.book.findMany({
            skip: parseInt(offset),
            take: parseInt(limit)
        });
        
        // Get total count for pagination info
        const totalBooks = await prisma.book.count();
        
        const totalPages = Math.ceil(totalBooks / limit);
        const hasMore = page < totalPages;
        
        res.status(200).json({
            books,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalBooks,
                hasMore,
                limit: parseInt(limit)
            }
        });
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

export const getAllBooksDataByCategory = async (req,res)=>{
    const {category} = req.params;
    const { page = 1, limit = 7 } = req.query;
    const offset = (page - 1) * limit;
    
    try{
        const books = await prisma.book.findMany({
            where: {
                categories: category
            },
            skip: parseInt(offset),
            take: parseInt(limit)
        });
        
        // Get total count for pagination info
        const totalBooks = await prisma.book.count({
            where: {
                categories: category
            }
        });
        
        const totalPages = Math.ceil(totalBooks / limit);
        const hasMore = page < totalPages;
        
        res.status(200).json({
            books,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalBooks,
                hasMore,
                limit: parseInt(limit)
            }
        });
    }
    catch(err){
        console.log(err,'error in listener-controller api');
        res.status(500).json({message: "Internal server error"});
    }
}

export const getFeaturedBooks = async (req,res)=>{
    try{
        const featuredBooks = await prisma.book.findMany({
            where: {
                featuredBook: true
            },
            orderBy: {
                releaseDate: 'desc'
            }
        });
        
        res.status(200).json({
            featuredBooks
        });
    }
    catch(err){
        console.log(err,'error in getFeaturedBooks api');
        res.status(500).json({message: "Internal server error"});
    }
}