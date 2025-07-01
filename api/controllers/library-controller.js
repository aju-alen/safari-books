import { PrismaClient } from '@prisma/client'

import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();

export const createLibrary = async (req,res)=>{
    console.log(req.userId,'req.userId');
    const {bookId} = req.params;
    const userId = req.userId;

    console.log(bookId,userId,'bookId and userId');

    const checkLibrary = await prisma.library.findFirst({
        where: {
            bookId,
            userId
        }
    })

    if(checkLibrary){
        return res.status(200).json({message: 'Book already in library'})
    }
    else{
        const library = await prisma.library.create({
            data: {
                bookId,
                userId
            }
        })
        return res.status(200).json({message: 'Book added to library', library})
    }
}

export const updateLibraryStatus = async (req, res) => {
    try {
        const { bookId } = req.params;
        const { status, timestamp } = req.body;
        const userId = req.userId;

        console.log(bookId, userId, status, timestamp, 'updateLibraryStatus params');

        const library = await prisma.library.findFirst({
            where: {
                bookId,
                userId
            }
        });

        if (!library) {
            return res.status(404).json({ message: 'Book not found in library' });
        }

        const updatedLibrary = await prisma.library.update({
            where: {
                id: library.id
            },
            data: {
                status,
                timestamp: timestamp || 0
            }
        });

        return res.status(200).json({ 
            message: 'Library status updated successfully', 
            library: updatedLibrary 
        });
    } catch (error) {
        console.error('Error updating library status:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getLibraryStatus = async (req, res) => {
    try {
        const { bookId } = req.params;
        const userId = req.userId;

        console.log(bookId, userId, 'getLibraryStatus params');

        const library = await prisma.library.findFirst({
            where: {
                bookId,
                userId
            }
        });

        if (!library) {
            return res.status(404).json({ message: 'Book not found in library' });
        }

        return res.status(200).json({ 
            message: 'Library status retrieved successfully', 
            library 
        });
    } catch (error) {
        console.error('Error getting library status:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getLibraryByStatus = async (req, res) => {
    try {
        const { status } = req.params;
        const userId = req.userId;

        console.log(status, userId, 'getLibraryByStatus params');

        let whereClause = {
            userId
        };

        // Add status filter if not "All Titles"
        if (status !== 'All') {
            whereClause.status = status;
        }

        const library = await prisma.library.findMany({
            where: whereClause,
            include: {
                book: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        durationInHours: true,
                        durationInMinutes: true,
                        coverImage: true,
                        authorName: true,
                        narratorName: true,
                        summary: true,
                        releaseDate: true,
                        language: true,
                        publisher: true,
                        rating: true,
                        categories: true,
                        colorCode: true,
                        sampleAudioURL: true,
                        completeAudioUrl: true,
                        isPublished: true,
                        amount: true,
                        companyId: true,
                        authorId: true,
                        featuredBook: true
                    }
                }
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });

        return res.status(200).json({ 
            message: 'Library books retrieved successfully', 
            books: library.map(item => ({
                ...item.book,
                libraryId: item.id,
                status: item.status,
                timestamp: item.timestamp,
                addedToLibrary: item.createdAt
            }))
        });
    } catch (error) {
        console.error('Error getting library by status:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
