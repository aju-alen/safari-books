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
                You're almost there!<br>
                Please verify your email address to activate your Safari Books account.
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-bottom:24px;">
                <a href="${backendUrl}/api/auth/verify/${verificationToken}" 
                   style="display:inline-block;padding:14px 32px;background:#4A4DFF;color:#fff;font-size:16px;font-weight:bold;border-radius:6px;text-decoration:none;letter-spacing:1px;">
                  VERIFY YOUR EMAIL
                </a>
              </td>
            </tr>
            <tr>
              <td style="font-family:sans-serif;color:#888;font-size:14px;padding-bottom:8px;">
                If the button above doesn't work, copy and paste this link into your browser:
              </td>
            </tr>
            <tr>
              <td style="font-family:monospace;color:#4A4DFF;font-size:13px;word-break:break-all;">
                ${backendUrl}/api/auth/verify/${verificationToken}
              </td>
            </tr>
            <tr>
              <td style="font-family:sans-serif;color:#bbb;font-size:12px;padding-top:32px;text-align:center;">
                &copy; ${new Date().getFullYear()} Safari Books. All rights reserved.
              </td>
            </tr>
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

const sendWelcomeEmail = async (email,name) => {

    const transporter = createTransport;
    const mailOptions = {
        from: process.env.GMAIL_AUTH_USER,
        to: email,
        subject: 'Welcome to Safari Books',
        html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Welcome to Safari Books</title>
</head>
<body style="background:#f6f8fa;margin:0;padding:0;font-family:'Segoe UI','Roboto',Arial,sans-serif;">
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
            <td style="font-family:sans-serif;color:#222;font-size:20px;padding-bottom:8px;">
              Welcome, ${name}!
            </td>
          </tr>
          <tr>
            <td style="font-family:sans-serif;color:#444;font-size:16px;padding-bottom:16px;">
              We're excited to have you join Safari Books.<br>
              With your account, you can sign in, discover audiobooks, and enjoy a world of knowledge and stories.
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <a href="${process.env.FRONTEND_URL}" 
                 style="display:inline-block;padding:14px 32px;background:#4A4DFF;color:#fff;font-size:16px;font-weight:bold;border-radius:6px;text-decoration:none;letter-spacing:1px;">
                View Your Safari Books Account
              </a>
            </td>
          </tr>
          <tr>
            <td style="font-family:sans-serif;color:#888;font-size:14px;padding-bottom:8px;">
              If the button above doesn't work, copy and paste this link into your browser:
            </td>
          </tr>
          <tr>
            <td style="font-family:monospace;color:#4A4DFF;font-size:13px;word-break:break-all;">
              ${process.env.FRONTEND_URL}
            </td>
          </tr>
          <tr>
            <td style="font-family:sans-serif;color:#bbb;font-size:12px;padding-top:32px;text-align:center;">
              &copy; ${new Date().getFullYear()} Safari Books. All rights reserved.<br>
              We use cookies to help provide and enhance our service. By continuing you agree to the use of cookies.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
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
        const token = jwt.sign({ userId: user.id, role:user.role, }, process.env.SECRET_KEY);
        res.status(200).json({ message: "Login successful", token, role:user.role, id:user.id, name:user.name, email:user.email });
    }
    catch (err) {
        console.log(err);
       next(err);
    }
}

export const getUserById = async (req, res) => {
    try{
        const user = await prisma.user.findUnique({
            where: {
                id: req.params.id
            }
        });
        await prisma.$disconnect();
        res.status(200).json({ message: "User data fetched successfully", user });
    }
    catch(err){
        console.log(err);
        res.status(500).json({ message: "Internal server error", err });
    }
}