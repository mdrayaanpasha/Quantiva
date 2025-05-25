import express from "express";
import mongoose from "mongoose";
import jwt, { decode } from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
dotenv.config();


import userSchema from "../schemas/userSchema.js";
import SubscriptionSchema from "../schemas/subscriptionSchema.js";
import companySchema from "../schemas/companySchema.js";

const User = mongoose.model("User", userSchema);
const Subscription = mongoose.model("Subscription", SubscriptionSchema);
const CompanyModel = mongoose.model("Company", companySchema);


mongoose
    .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB connected successfully"))
    .catch((err) => console.error("MongoDB connection error:", err));


const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: { user: process.env.EMAIL, pass: process.env.EMAIL_PASS },
});


class AuthController {

    async Register(req, res) {
        const { username, email, password } = req.body;
        const existingUser = await User.findOne({ email });

        if (existingUser) return res.status(400).json({ error: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1h" });
        const verifyLink = `${process.env.FRONTEND_URL}/verify/${token}`;

        await transporter.sendMail({
            to: email,
            subject: "Verify Your Email",
            html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Email</title>
            <style>
                body {
                    font-family: 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: #f4f4f4;
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                }
                .container {
                    max-width: 600px;
                    margin: 40px auto;
                    background-color: #ffffff;
                    padding: 30px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                    text-align: center;
                }
                .header {
                    padding-bottom: 20px;
                    border-bottom: 1px solid #eeeeee;
                    margin-bottom: 30px;
                }
                .header h1 {
                    color: #333333;
                    font-size: 28px;
                    margin: 0;
                    font-weight: 700;
                }
                .content p {
                    color: #555555;
                    font-size: 16px;
                    line-height: 1.6;
                    margin-bottom: 25px;
                }
                .button {
                    display: inline-block;
                    background-color: #000000; /* Black for primary action */
                    color: #ffffff !important;
                    padding: 14px 28px;
                    border-radius: 6px;
                    text-decoration: none;
                    font-weight: 600;
                    font-size: 17px;
                    transition: background-color 0.2s ease-in-out;
                }
                .button:hover {
                    background-color: #333333;
                }
                .footer {
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #eeeeee;
                    color: #aaaaaa;
                    font-size: 13px;
                }
                .footer a {
                    color: #888888;
                    text-decoration: none;
                }
                .footer a:hover {
                    text-decoration: underline;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Verify Your Email Address</h1>
                </div>
                <div class="content">
                    <p>Hi there,</p>
                    <p>Thanks for signing up! To complete your registration and activate your account, please click the button below to verify your email address:</p>
                    <a href="${verifyLink}" class="button">Verify My Email</a>
                    <p style="margin-top: 30px;">If the button above doesn't work, you can also copy and paste the following link into your web browser:</p>
                    <p style="word-break: break-all; font-size: 14px; color: #777777;">${verifyLink}</p>
                    <p>This link is valid for a limited time. If you didn't create an account with us, please ignore this email.</p>
                </div>
                <div class="footer">
                    <p>&copy; 2025 Your Company Name. All rights reserved.</p>
                    <p>
                        <a href="#">Privacy Policy</a> | <a href="#">Terms of Service</a>
                    </p>
                </div>
            </div>
        </body>
        </html>
    `,
        });

        res.json({ message: "Verification email sent" });
    }

    async login(req, res) {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ error: "User not found" });
        if (!user.verified) return res.status(400).json({ error: "Email not verified" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Incorrect password" });

        const authToken = jwt.sign({ email: user.email, id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.json({ message: "Login successful", token: authToken });
    }

    async forgetPassword(req, res) {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ error: "User not found" });

        const resetToken = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: "15m" });

        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        await transporter.sendMail({
            to: email,
            subject: "Reset Your Password",
            text: `Click here to reset: ${resetLink}`,
        });

        res.json({ message: "Password reset email sent" });
    }

    async resetPassword(req, res) {
        const { token, newPassword } = req.body;

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log(decoded.email)
            const user = await User.findOne({ email: decoded.email });

            if (!user) return res.status(400).json({ error: "User not found" });

            user.password = await bcrypt.hash(newPassword, 10);
            await user.save();

            res.json({ message: "Password reset successful" });
        } catch (err) {
            res.status(400).json({ error: "Invalid or expired token" });
        }
    }

    async verify(req, res) {
        const { token } = req.body;

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findOne({ email: decoded.email });

            if (!user) return res.status(400).json({ message: "User not found" });

            if (!user.verified) {
                user.verified = true;
                await user.save();
            }

            const authToken = jwt.sign({ email: user.email, id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

            return res.json({ message: "Email verified successfully", token: authToken });
        } catch (err) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }
    }
}
export default new AuthController()