import crypto from "crypto";
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt';
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import { backendUrl } from "../utils/backendUrl.js";
import { registerEmailTemplate, sendWelcomeEmailTemplate } from "../utils/emailTemplate.js";
import { resendEmailBoiler } from "../utils/resendFunction.js";
import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();

export const register = async (req, res) => {
    const { name, email, password,role } = req.body;
    try{

        if (!name ||  !email || !password || !role) {
            return res.status(400).json({ message: "Please fill all the fields" });
        }
        const userExists = await prisma.user.findUnique({
            where: {
                email
            }
        });
        if (userExists) {
            return res.status(400).json({ message: "User already exists. You can login" });
        }

        const lowercaseEmail = email.toLowerCase();
        const hashedPassword = await bcrypt.hash(password, 10);
        const emailVerificationToken = crypto.randomBytes(64).toString('hex');

        const user = await prisma.user.create({
            data: {
                email: lowercaseEmail,
                password: hashedPassword,
                name,
                emailVerificationToken,
                role
            }
        });
        await prisma.$disconnect();
        if (!user) {
            return res.status(400).json({ message: "User registration failed. please try again" });
        }
        const emailTemplate = registerEmailTemplate(name, emailVerificationToken, backendUrl);
        const response = await resendEmailBoiler(process.env.NAMECHEAP_EMAIL, req.body.email, 'Verify Your Email - Safari Books', emailTemplate);

        console.log(response, 'response');
        res.status(201).json({ message: "User registered successfully. Please verify your details by email.",id:user.id });
    }
    catch(error){
        console.log(error);
        res.status(500).json({ message: "An error has occoured, please contact support" });
    }
};


export const verifyEmail = async (req, res) => {
    try {

        const emailVerificationToken = req.params.token;
        console.log(emailVerificationToken, 'emailVerificationToken');
       const userToken = await prisma.user.findFirst({
            where: {
                emailVerificationToken: emailVerificationToken
            }
        })
        console.log(userToken, 'userToken');
        if (!userToken) {
            return res.status(400).json({ message: 'Invalid token' })
        }
    
       const updatedUser =  await prisma.user.update({
            where: {
                id: userToken.id
            },
            data: {
                emailVerified: true,
                emailVerificationToken: ''
            }
        })
        await prisma.$disconnect();

        const emailTemplate = sendWelcomeEmailTemplate(updatedUser.name);
        const response = await resendEmailBoiler(process.env.NAMECHEAP_EMAIL, updatedUser.email, 'Welcome to Safari Books', emailTemplate);
        await prisma.$disconnect();
        res.status(200).send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Account Verified | Safari Books</title>
</head>
<body style="background:#f6f8fa;margin:0;padding:0;font-family:'Segoe UI','Roboto',Arial,sans-serif;">
  <div style="max-width:400px;margin:60px auto;background:#fff;border-radius:16px;box-shadow:0 2px 12px rgba(74,77,255,0.08);padding:40px 32px 32px 32px;text-align:center;">
    <div style="font-size:56px;color:#4A4DFF;margin-bottom:16px;">✅</div>
    <div style="font-size:2rem;color:#222;margin-bottom:8px;font-weight:700;">Account Verified!</div>
    <div style="color:#555;font-size:1.1rem;margin-bottom:32px;">
      Your email has been successfully verified.<br>
      You can now log in and start exploring Safari Books.
    </div>
   
    <div style="margin-top:32px;color:#bbb;font-size:0.9rem;">
      &copy; <span id="year">${new Date().getFullYear()}</span> Safari Books. All rights reserved.
    </div>
  </div>
</body>
</html>
`)
    }
    catch (err) {
        console.log(err);
        res.status(400).send('An error occoured')
    }
}


export const login = async (req, res, next) => {
    try {
      let user;
        const { email,password } = req.body;
        console.log(email, password,'email, password');
        
        user = await prisma.user.findUnique({
            where: {
                email
            }
        });
        if(!user){
          user = await prisma.admin.findUnique({
            where: {
              email
            }
          });
        }
        console.log(user, 'user');
       
        if (!user) {
            return res.status(400).json({ message: "No account exists. Please register" });
        }
        if (!user.emailVerified) {
            return res.status(400).json({ message: "Please verify your email" });
        }
        let isCorrect = bcrypt.compareSync(password, user.password)
        if (!isCorrect) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        const token = jwt.sign({ userId: user.id, role:user.role, email:user.email, name:user.name }, process.env.SECRET_KEY);
        res.status(200).json({ message: "Login successful", token, role:user.role, id:user.id, name:user.name, email:user.email });
    }
    catch (err) {
        console.log(err);
       next(err);
    }
}
export const loginAdmin = async (req, res, next) => {
    console.log(req.body, 'req.body');
    
    try {
        const { email,password } = req.body;
        console.log(email, password,'email, password');
        
        const user = await prisma.admin.findUnique({
            where: {
                email
            }
        });
        console.log(user, 'user');
       
        if (!user) {
            return res.status(400).json({ message: "No account exists. Please register" });
        }
        if (!user.emailVerified) {
            return res.status(400).json({ message: "Please verify your email" });
        }
        let isCorrect = bcrypt.compareSync(password, user.password)
        if (!isCorrect) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        const token = jwt.sign({ userId: user.id, role:user.role, email:user.email, name:user.name}, process.env.SECRET_KEY);
        res.status(200).json({ message: "Login successful", token, role:user.role, id:user.id, name:user.name, email:user.email });
    }
    catch (err) {
        console.log(err);
       next(err);
    }
}

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                emailVerified: true,
                firstTimeLogin: true,
                createdAt: true,
                updatedAt: true
            }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        await prisma.$disconnect();
        res.status(200).json(user);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "An error occurred while fetching user data" });
    }
};

export const updateUserProfile = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const userId = req.userId; // Get userId from JWT middleware

        if (!name && !email && !password) {
            return res.status(400).json({ message: "At least one field (name, email, or password) is required" });
        }

        // Find the user
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const updateData = {};

        // Update name if provided
        if (name && name.trim() !== '') {
            updateData.name = name.trim();
        }

        // Update email if provided
        if (email && email.trim() !== '') {
            const lowercaseEmail = email.toLowerCase().trim();
            
            // Check if email is already taken by another user
            const existingUser = await prisma.user.findFirst({
                where: {
                    email: lowercaseEmail,
                    id: { not: userId }
                }
            });

            if (existingUser) {
                return res.status(400).json({ message: "Email is already taken by another user" });
            }

            updateData.email = lowercaseEmail;
            updateData.emailVerified = false; // Require email verification for new email
            updateData.emailVerificationToken = crypto.randomBytes(64).toString('hex');
        }

        // Update password if provided
        if (password && password.trim() !== '') {
            if (password.length < 6) {
                return res.status(400).json({ message: "Password must be at least 6 characters long" });
            }
            updateData.password = await bcrypt.hash(password, 10);
        }

        // Update the user
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                emailVerified: true,
                firstTimeLogin: true,
                createdAt: true,
                updatedAt: true
            }
        });
        const token = jwt.sign({ userId: updatedUser.id, role:updatedUser.role, }, process.env.SECRET_KEY);


        // Send verification email if email was changed
        if (email && email.trim() !== '') {
            sendVerificationEmail(updatedUser.email, updateData.emailVerificationToken, updatedUser.name);
        }

        await prisma.$disconnect();
        
        res.status(200).json({ 
            message: "Profile updated successfully", 
            user: updatedUser,
            emailChanged: !!email,
            token: token
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "An error occurred while updating the profile" });
    }
};

export const deleteAccount = async (req, res) => {
    try {
        const { password } = req.body;
        const userId = req.userId; // Get userId from JWT middleware

        if (!password) {
            return res.status(400).json({ message: "Password is required" });
        }

        // Find the user
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password" });
        }

        // Delete the user (this will cascade delete companies, authors, and books)
        await prisma.user.delete({
            where: { id: userId }
        });

        await prisma.$disconnect();
        
        res.status(200).json({ message: "Account deleted successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "An error occurred while deleting the account" });
    }
};

export const registerPushToken = async (req, res) => {
    try {

        const { pushToken } = req.body;
        const userId = req.userId; // Get userId from JWT middleware

        console.log(pushToken, 'pushToken in push token api');
        console.log(userId, 'userId in push token api');

        if (!pushToken) {
            return res.status(400).json({ message: "Push token is required" });
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update user with push token
        await prisma.user.update({
            where: { id: userId },
            data: {
                pushToken: pushToken
            }
        });

        await prisma.$disconnect();
        
        console.log(`Push token registered for user ${userId}: ${pushToken}`);
        res.status(200).json({ message: "Push token registered successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "An error occurred while registering push token" });
    }
}

// Admin registration
// export const registerAdmin = async (req, res) => {
//     const { name, email, password } = req.body;
    
//     try {
//         if (!name || !email || !password) {
//             return res.status(400).json({ message: "Please fill all the fields" });
//         }

//         const adminExists = await prisma.admin.findUnique({
//             where: {
//                 email
//             }
//         });

//         if (adminExists) {
//             return res.status(400).json({ message: "Admin already exists" });
//         }

//         const lowercaseEmail = email.toLowerCase();
//         const hashedPassword = await bcrypt.hash(password, 10);

//         const admin = await prisma.admin.create({
//             data: {
//                 email: lowercaseEmail,
//                 password: hashedPassword,
//                 name,
//                 role: "ADMIN"
//             }
//         });

//         await prisma.$disconnect();

//         if (!admin) {
//             return res.status(400).json({ message: "Admin registration failed. Please try again" });
//         }

//         console.log("Admin registered successfully", req.body.email, name);
        
//         res.status(201).json({ 
//             message: "Admin registered successfully", 
//             id: admin.id 
//         });
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ message: "An error has occurred, please contact support" });
//     }
// };

export const webAdminLogin = async (req, res) => {
    try {
        console.log(req.body, 'req.body');
        const { email,password } = req.body;
        const admin = await prisma.admin.findUnique({
            where: {
                email
            }
        });
        if (!admin) {
            return res.status(400).json({ message: "No account exists. Please register" });
        }
        let isCorrect = bcrypt.compareSync(password, admin.password)
        if (!isCorrect) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        const token = jwt.sign({ userId: admin.id, role:admin.role, email:admin.email, name:admin.name }, process.env.SECRET_KEY);
        res.status(200).json({ message: "Login successful", token, role:admin.role, id:admin.id, name:admin.name, email:admin.email });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: "An error has occurred, please contact support" });
    }
}