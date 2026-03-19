import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config({quiet:true});

export const sendEmail = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.Gmail_user, 
      pass: process.env.Gmail_password, 
    },
  });

  if (!process.env.Gmail_user || !process.env.Gmail_password) {
    console.error("❌ Email credentials missing in environment variables!");
    throw new Error("Email configuration is missing on the server.");
  }

  await transporter.sendMail({
    from: `"Majestic Events" <${process.env.Gmail_user}>`,
    to,
    subject,
    text,
  });
};
