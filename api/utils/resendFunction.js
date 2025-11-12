import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();    
const resend = new Resend(process.env.RESEND_API_KEY);



export const resendEmailBoiler = async (senderEmail, recipientEmail, subject, html) => {
    try {
        console.log(senderEmail, recipientEmail, subject, html, 'resendEmailBoiler');
        const response = await resend.emails.send({
            from: senderEmail,
            to: recipientEmail,
            subject: subject,
            html: html,
        });
        return response;
    }
    catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}