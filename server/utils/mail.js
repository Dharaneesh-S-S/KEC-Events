// server/utils/mail.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config(); 

export const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});

export const sendMail = async ({ to, subject, text, html }) => {
  try {
    await transporter.sendMail({
      from: `"KEC Events Admin" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });
  } catch (error) {
    console.error('📧 Email sending error:', error.message);
  }
};
