import express from 'express';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// 1. Recreate __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// 2. Load .env from a parent or custom directory
dotenv.config({
    path: path.resolve(__dirname, '../.env') // Move up one level
});

const app = express();
app.use(express.json());

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', // Replace with your provider
    port: 465,
    secure: true,
    auth: {
        user: 'priyankapudi4u@gmail.com',
        pass: process.env.NODE_MAILER_PASS
    },
});

try {
    await transporter.verify();
    console.log("Server is ready to take our messages");
} catch (err) {
    console.error("Verification failed:", err);
}

export default transporter;

