import express from 'express';
import pool from '../configs/db.js';
import transporter from '../configs/nodeMailer.js';
import otpGenerator from 'otp-generator';

const router = express.Router();


router.post('/forgot', async (req, res) => {
    const { user_email } = req.body;
    const result = await pool.query('SELECT user_mail FROM users WHERE user_mail = $1', [user_email]);
    // Generate a 6-digit numeric OTP
    const otp = otpGenerator.generate(6, {
        upperCaseAlphabets: true,
        specialChars: false,
        lowerCaseAlphabets: false,
        digits: true
    });

    if (result.rows.length === 0) {
        return res.status(404).json({ message: "Email not found" });
    }
    try {
        const info = await transporter.sendMail({
            from: '"CineMatter" <priyankapudi4u@gmail.com>', // sender address
            to: "onefornone49@gmail.com", // list of recipients
            subject: "Testing OTP", // subject line
            text: "This is testing the OTP", // plain text bodb
            html: `<b>${otp}</b>`, // HTML body
        });
        const find_otp = 'SELECT otp_gen FROM otp WHERE user_mail = $1';
        const found_otp = await pool.query(find_otp, [user_email]);
        if (found_otp.rows.length >= 0) {
            await pool.query('UPDATE otp SET otp_gen=$1,expires_at=NOW() + INTERVAL \'15 minutes\' WHERE user_mail=$2', [otp, user_email]);
        } else {
            const query = 'INSERT INTO otp (user_mail,otp_gen, expires_at) VALUES ($1,$2, NOW() + INTERVAL \'15 minutes\') RETURNING *';
            await pool.query(query, [user_email, otp]);
        }
        console.log("Message sent: %s", info.messageId);
        res.status(200).json({ message: "Email sent successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/verifyOTP', async (req, res) => {
    const { client_otp, user_email } = req.body;
    const query = 'SELECT otp_gen FROM otp WHERE user_mail = $1';
    const stored_otp = await pool.query(query, [user_email]);
    if (client_otp === stored_otp.rows[0].otp_gen) {
        const update_otp = await pool.query('UPDATE otp SET otp_set=TRUE WHERE user_mail=$1', [user_email]);
        res.status(200).json({ message: "otp is correct" });
    } else {
        res.status(400).json({ message: "The OTP is incorrect" })
    }
})

export default router;
