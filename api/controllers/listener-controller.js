
import dotenv from "dotenv";
dotenv.config();

import { prisma } from '../utils/database.js'

export const getAllBooksData = async (req,res)=>{
    const { page = 1, limit = 7 } = req.query;
    const offset = (page - 1) * limit;
    
    try{
        const books = await prisma.book.findMany({
            skip: parseInt(offset),
            take: parseInt(limit),
            include: {
                _count: {
                    select: {
                        Library: true
                    }
                }
            }
        });
        
        // Transform the data to include library count in a more readable format
        const booksWithLibraryCount = books.map(book => ({
            ...book,
            libraryCount: book._count.Library
        }));
        
        // Get total count for pagination info
        const totalBooks = await prisma.book.count();
        
        const totalPages = Math.ceil(totalBooks / limit);
        const hasMore = page < totalPages;
        
        res.status(200).json({
            books: booksWithLibraryCount,
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
            include: {
                _count: {
                    select: {
                        Library: true
                    }
                }
            }
        });
        if(!book){
            return res.status(404).json({message: "Book not found"});
        }
        
        // Transform the data to include library count in a more readable format
        const bookWithLibraryCount = {
            ...book,
            libraryCount: book._count.Library
        };
        
        res.status(200).json(bookWithLibraryCount);
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
            take: parseInt(limit),
            include: {
                _count: {
                    select: {
                        Library: true
                    }
                }
            }
        });
        
        // Transform the data to include library count in a more readable format
        const booksWithLibraryCount = books.map(book => ({
            ...book,
            libraryCount: book._count.Library
        }));
        
        // Get total count for pagination info
        const totalBooks = await prisma.book.count({
            where: {
                categories: category
            }
        });
        
        const totalPages = Math.ceil(totalBooks / limit);
        const hasMore = page < totalPages;
        
        res.status(200).json({
            books: booksWithLibraryCount,
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
            },
            include: {
                _count: {
                    select: {
                        Library: true
                    }
                }
            }
        });
        
        // Transform the data to include library count in a more readable format
        const featuredBooksWithLibraryCount = featuredBooks.map(book => ({
            ...book,
            libraryCount: book._count.Library
        }));
        
        res.status(200).json({
            featuredBooks: featuredBooksWithLibraryCount
        });
    }
    catch(err){
        console.log(err,'error in getFeaturedBooks api');
        res.status(500).json({message: "Internal server error"});
    }
}

export const bookmarkBook = async (req,res)=> {
    try {
        const {bookId} = req.params;
        const userId = req.userId;

        const existingBookmark = await prisma.bookmark.findUnique({
            where: {
                userId_bookId: {
                    userId,
                    bookId
                }
            }
        });

        if(existingBookmark){
            await prisma.bookmark.delete({
                where: {id: existingBookmark.id}
            })
            res.status(200).json({message: "Bookmark deleted"});
        }else{
            const newBookmark = await prisma.bookmark.create({
                data: {
                    userId,
                    bookId
                }
            })
            res.status(200).json({message: "Bookmark created"});
        }
    } catch (error) {
        console.log(error,'error in bookmarkBook api');
        res.status(500).json({message: "Internal server error"});
    }
}

export const listenerAnalytics = async (req,res)=>{
    try {

        const finishedBooks = await prisma.library.count({
            where: {
                userId: req.userId,
                status: "FINISHED"
            }
        });

        const inProgressBooks = await prisma.library.count({
            where: {
                userId: req.userId,
                status: "IN_PROGRESS"
            }
        });

        if(finishedBooks === 0 && inProgressBooks === 0){
          finishedBooks = 0;
          inProgressBooks = 0;
        }
        
        res.status(200).json({ message: "Publisher insights fetched successfully", finishedBooks, inProgressBooks });
    } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Internal server error", error });
    }
    
    }

export const getBookRecommendations = async (req,res)=>{
    const {id} = req.params;
    try{
        const book = await prisma.book.findUnique({
            where: {
                id: id
            }
        });
        if(!book){
            return res.status(404).json({message: "Book not found"});
        }
        const bookCategories = book.categories;
        
        // First, try to find books with the same categories
        let bookRecommendations = await prisma.book.findMany({
            where: {
                categories: bookCategories,
                id: {
                    not: id // Exclude the current book from recommendations
                }
            }
        });

        // If no recommendations found, get the latest books instead
        if (bookRecommendations.length === 0) {
            bookRecommendations = await prisma.book.findMany({
                where: {
                    id: {
                        not: id // Still exclude the current book
                    }
                },
                orderBy: {
                    releaseDate: 'desc' // Get latest books
                },
                take: 10 // Limit to 10 latest books
            });
        }

        res.status(200).json({books: bookRecommendations});
    }
    catch(err){
        console.log(err,'error in getBookRecommendations api');
        res.status(500).json({message: "Internal server error"});
    }
}

export const getAllBooksDataByRecent = async (req,res)=>{
    try{
        // Calculate the date 2 weeks ago from current date
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        
        const books = await prisma.book.findMany({
            where: {
                publishedAt: {
                    gte: twoWeeksAgo,
                    lte: new Date()
                }
            },
            orderBy: {
                publishedAt: 'desc'
            }
        });
        res.status(200).json({books});
    }
    catch(err){
        console.log(err,'error in getAllBooksDataByRecent api');
        res.status(500).json({message: "Internal server error"});
    }
}