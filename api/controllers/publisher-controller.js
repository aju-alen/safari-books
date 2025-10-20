
import nodemailer from 'nodemailer';
import dotenv from "dotenv";
dotenv.config();

import { prisma } from '../utils/database.js'

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
                    narrationSampleHeartzRate:JSON.stringify(req.body.voiceConfig.sampleRate),
                    narrationSpeakingRate:JSON.stringify(req.body.voiceConfig.speakingRate),
                    narrationGender:req.body.voiceConfig.voiceType,
                    narrationLanguageCode:req.body.voiceConfig.voiceDetails.languageCode,
                    narrationVoiceName:req.body.voiceConfig.voiceDetails.voiceName,
                    audioSampleURL:req.body.audioSampleURL,
                    pdfURL:req.body.pdfURL,
                    rightsHolder:req.body.rightsHolder,
                    coverImage:req.body.coverImage,
                    amount:req.body.amount * 100,
                    isRegistrationComplete: true // Mark registration as complete
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
                    narrationSampleHeartzRate:JSON.stringify(req.body.voiceConfig.sampleRate),
                    narrationSpeakingRate:JSON.stringify(req.body.voiceConfig.speakingRate),
                    narrationGender:req.body.voiceConfig.voiceType,
                    narrationLanguageCode:req.body.voiceConfig.voiceDetails.languageCode,
                    narrationVoiceName:req.body.voiceConfig.voiceDetails.voiceName,
                    audioSampleURL:req.body.audioSampleURL,
                    pdfURL:req.body.pdfURL,
                    rightsHolder:req.body.rightsHolder,
                    coverImage:req.body.coverImage,
                    amount:req.body.amount * 100,
                    isRegistrationComplete: true // Mark registration as complete
                }
            });
        }

        sendConfirmationEmailToPublisher(req.email, req.name);
        // sendConfirmationEmailToAdmin(process.env.NAMECHEAP_EMAIL, req.name);
       
        res.status(204).json({ message: "Company updated successfully"});

    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", error });

    }
}

const sendConfirmationEmailToPublisher = async (email, name) => {
    console.log(process.env.NAMECHEAP_EMAIL);
    console.log(process.env.NAMECHEAP_EMAIL_PASSWORD);

    const transporter = nodemailer.createTransport({
        host: 'mail.privateemail.com',
        port: 587,
        secure: false,
          auth: {
              user: process.env.NAMECHEAP_EMAIL,
              pass: process.env.NAMECHEAP_EMAIL_PASSWORD
          }
    });

    const mailOptions = {
        from: process.env.NAMECHEAP_EMAIL,
        to: email,
        subject: 'Publisher Confirmation',
        html: `
<html>
  <body style="margin:0;padding:0;background:#f6f8fa;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f8fa;padding:40px 0;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.07);padding:32px;">
            <tr>
              <td align="center" style="padding-bottom:24px;">
                <img src="https://safari-books-mobile.s3.ap-south-1.amazonaws.com/Assets/sbLogo.png" alt="Safari Books" width="60" style="border-radius:8px;" />
                <h2 style="font-family:sans-serif;color:#4A4DFF;margin:16px 0 0 0;">Safari Books</h2>
              </td>
            </tr>
            <tr>
              <td style="font-family:sans-serif;color:#222;font-size:18px;padding-bottom:8px;">
                Hi ${name},
              </td>
            </tr>
            <tr>
              <td style="font-family:sans-serif;color:#444;font-size:16px;padding-bottom:16px;">
                Your book has been published successfully. Thank you for using Safari Books. The admins will review your book and get back to you soon. <br>
              </td>
            </tr>
           
            <tr>
              <td style="font-family:sans-serif;color:#888;font-size:14px;padding-bottom:8px;">
                If you have any questions, please contact us at ${process.env.NAMECHEAP_EMAIL}
              </td>
            </tr>
            <tr>
              <td style="font-family:monospace;color:#4A4DFF;font-size:13px;word-break:break-all;">
                ${process.env.NAMECHEAP_EMAIL}
              </td>            
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
    }

    //send the mail
    try {
        const response = await transporter.sendMail(mailOptions);
        console.log("Verification email sent", response);
    }
    catch (err) {
        console.log("Err sending verification email", err);
    }
}

const sendConfirmationEmailToAdmin = async (email, name) => {
    const transporter = nodemailer.createTransport({
        host: 'mail.privateemail.com',
        port: 587,
        secure: false,
          auth: {
              user: process.env.NAMECHEAP_EMAIL,
              pass: process.env.NAMECHEAP_EMAIL_PASSWORD
          }
    });
    const mailOptions = {
        from: process.env.NAMECHEAP_EMAIL,
        to: email,
        subject: 'Publisher Confirmation',
        html: `
        <html>
        <body>
        <h1>New Book Published</h1>
        <p>A new book has been published by a publisher. Please review the book and approve or reject it.</p>
        </body>
        </html>
        `
    }
    try {
        const response = await transporter.sendMail(mailOptions);
        console.log("Confirmation email sent to admin", response);
    }
    catch (err) {
        console.log("Err sending confirmation email to admin", err);
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
        res.status(201).json({ message: "Book created successfully", createPostmanBook });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", error });
    }
}

export const publisherAnalytics = async (req, res) => {
try {

    const bookCount = await prisma.book.count({
        where: {
            userId: req.body.userId,
        }
    });

    const ListenersStats = await prisma.library.count({
        where: {
            userId: req.body.userId,
        }
    });

    console.log(bookCount, ListenersStats);
    res.status(200).json({ message: "Publisher insights fetched successfully", bookCount, ListenersStats });
} catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", error });
}

}