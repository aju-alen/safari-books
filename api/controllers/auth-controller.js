import crypto from "crypto";
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt';
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import { backendUrl } from "../utils/backendUrl.js";
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
        console.log("User registered successfully",req.body.email, emailVerificationToken, name);
        sendVerificationEmail(req.body.email, emailVerificationToken, name);

        res.status(201).json({ message: "User registered successfully. Please verify your details by email.",id:user.id });
    }
    catch(error){
        console.log(error);
        res.status(500).json({ message: "An error has occoured, please contact support" });
    }
};

const createTransport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_AUTH_USER,
        pass: process.env.GMAIL_AUTH_PASS
    }
})

const sendVerificationEmail = async (email, verificationToken, name) => {
    console.log(process.env.GMAIL_AUTH_USER);
    console.log(process.env.GMAIL_AUTH_PASS);

    const transporter = createTransport;
    const mailOptions = {
        from: process.env.GMAIL_AUTH_USER,
        to: email,
        subject: 'Verify Your Email Address',
        html: `
    <html>
    <body>
        <div>

          
            <p>Safari Books</p>

        </div>
        <div>
            <p>Hi ${name},</p>
            <p>You're almost there.</p>
            <br>
            <p>We just need to verify your email address before you can access your Safari Books account. Verifying your email address helps secure your account.</p>
            <br>
            <p><a href="${backendUrl}/api/auth/verify/${verificationToken}">VERIFY YOUR EMAIL</a></p>
            <br>
            <p>Cannot verify your email by clicking the button? Copy and paste the URL into your browser to verify your email.</p>
            <br>
            <p>${backendUrl}/api/auth/verify/${verificationToken}</p>
        </div>
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
        await prisma.$disconnect()
            sendWelcomeEmail(updatedUser.email, updatedUser.name);
        console.log(updatedUser, 'updatedUser');
        res.status(200).send("Your email has been verified!")
    }
    catch (err) {
        console.log(err);
        res.status(400).send('An error occoured')
    }
}

const sendWelcomeEmail = async (email,name) => {

    const transporter = createTransport;
    const mailOptions = {
        from: process.env.GMAIL_AUTH_USER,
        to: email,
        subject: 'Welcome to Safari Books',
        html: `
    <html>
    <body>
        <div>

           
            <p>Safari Books</p>

        </div>
        <div>
            <p>welcome ${name},</p>
            <p>With your Safari Books account you can sign in, create forms and send it to anyone you like without them having to sign up. It is that simple!.</p>
            <br>
            <p>The Safari Books Team</p>
            <br>
            <p><a href="${process.env.FRONTEND_URL}">View Your Safari Books Account</a></p>
            <br>
            <p>--------------------</p>
            <p>Copyright © 2024, Safari Books, its licensors and distributors. All rights are reserved, including those for text and data mining.</p>
            <br>
            
            <p>We use cookies to help provide and enhance our service. By continuing you agree to the use of cookies.</p>
        </div>
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

export const login = async (req, res, next) => {
    try {
        const { email,password } = req.body;
        console.log(email, password,'email, password');
        
        const user = await prisma.user.findUnique({
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
        const token = jwt.sign({ userId: user.id, role:user.role, }, process.env.SECRET_KEY);
        res.status(200).json({ message: "Login successful", token, role:user.role, id:user.id, name:user.name, email:user.email });
    }
    catch (err) {
        console.log(err);
       next(err);
    }
}