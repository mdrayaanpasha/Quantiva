import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import mongoose from "mongoose";

import userSchema from "../schemas/userSchema.js";
import SubscriptionSchema from "../schemas/subscriptionSchema.js";
import companySchema from "../schemas/companySchema.js";

dotenv.config();

const User = mongoose.model("User", userSchema);
const Subscription = mongoose.model("Subscription", SubscriptionSchema);
const CompanyModel = mongoose.model("Company", companySchema);

class CompanyController {

    async fetchGeminiAnalysis(prompt) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("Missing GEMINI_API_KEY in environment variables.");
        }

        try {
            const response = await axios.post(
                "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent",
                {
                    contents: [{ parts: [{ text: prompt }] }],
                },
                {
                    headers: { "Content-Type": "application/json" },
                    params: { key: apiKey },
                }
            );
            return response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
        } catch (error) {
            console.error("Gemini API Error:", error.response?.data || error.message);
            throw new Error("Failed to fetch analysis from Gemini.");
        }
    }

    async getRedditAnalysis(req, res) {
        const { companyName } = req.params;
        const prompt = `Summarize recent Reddit discussions on ${companyName}'s stock: trends, sentiment, and hot takes. Make the response concise and to the point while personalizing the experience. Don't generalize; mention which source said what. Overall, be concise, minimalist, and professional.`;
        try {
            const summary = await this.fetchGeminiAnalysis(prompt);
            res.json({ summary });
        } catch (error) {
            res.status(500).send(error.message);
        }
    }

    async getSECAnalysis(req, res) {
        const { companyName } = req.params;
        const prompt = `Summarize the latest SEC filings for ${companyName}. Focus on earnings, risks, and major disclosures. Make the response concise and to the point while personalizing the experience. Don't generalize; mention which source said what. Overall, be concise, minimalist, and professional.`;
        try {
            const summary = await this.fetchGeminiAnalysis(prompt);
            res.json({ summary });
        } catch (error) {
            res.status(500).send(error.message);
        }
    }

    async getTwitterAnalysis(req, res) {
        const { companyName } = req.params;
        const prompt = `Summarize Twitter sentiment on ${companyName}: major tweets, investor opinions, and trending topics. Make the response concise and to the point while personalizing the experience. Don't generalize; mention which source said what. Overall, be concise, minimalist, and professional.`;
        try {
            const summary = await this.fetchGeminiAnalysis(prompt);
            res.json({ summary });
        } catch (error) {
            res.status(500).send(error.message);
        }
    }

    async getWallStreetAnalysis(req, res) {
        const { companyName } = req.params;
        const prompt = `Summarize discussions on WallStreetBets about ${companyName}: memes, speculation, and market outlook. Make the response concise and to the point while personalizing the experience. Don't generalize; mention which source said what. Overall, be concise, minimalist, and professional.`;
        try {
            const summary = await this.fetchGeminiAnalysis(prompt);
            res.json({ summary });
        } catch (error) {
            res.status(500).send(error.message);
        }
    }

    async addCompany(req, res) {
        try {
            const { name, date, noOfShares } = req.body;

            if (!req.user || !req.user.email) {
                return res.status(401).json({ error: "Unauthorized: Email missing in token" });
            }

            const email = req.user.email;
            console.log("User email from token:", email);

            let tikkr = "UNKNOWN";

            try {
                const apiKey = process.env.GEMINI_API_KEY;
                const response = await axios.post(
                    "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent",
                    {
                        contents: [
                            {
                                parts: [
                                    {
                                        text: `What is the stock ticker symbol for the company "${name}"? Return ONLY the ticker symbol, nothing else.`,
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        headers: { "Content-Type": "application/json" },
                        params: { key: apiKey },
                    }
                );

                tikkr = response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "UNKNOWN"; // Fixed extraction for Gemini 2.0+
            } catch (error) {
                console.error("Gemini API Error fetching ticker:", error.message);
                // Continue with UNKNOWN ticker if API fails
            }

            const newCompany = new CompanyModel({
                name,
                date: new Date(date),
                noOfShares,
                email,
                tikkr,
            });

            await newCompany.save();
            res.status(201).json({ message: "Company added successfully", tikkr });
        } catch (error) {
            console.error("Database Save Error:", error);
            res.status(500).json({ error: "Failed to add company", details: error.message });
        }
    }

    async getCompanies(req, res) {
        try {
            if (!req.user || !req.user.email) {
                return res.status(401).json({ error: "Unauthorized: User email not found in token" });
            }
            const companies = await CompanyModel.find({ email: req.user.email });
            res.json(companies);
        } catch (err) {
            console.error("Error fetching companies:", err);
            res.status(500).json({ error: "Server error fetching companies" });
        }
    }
}

export default new CompanyController();