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
            text: `Click here to verify: ${verifyLink}`,
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