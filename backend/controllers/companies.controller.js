import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import mongoose from "mongoose";
import redis from "redis";

import userSchema from "../schemas/userSchema.js";
import SubscriptionSchema from "../schemas/subscriptionSchema.js";
import companySchema from "../schemas/companySchema.js";

dotenv.config();

// Redis setup
const redisClient = redis.createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379"
});

redisClient.connect().catch(console.error);

const User = mongoose.model("User", userSchema);
const Subscription = mongoose.model("Subscription", SubscriptionSchema);
const CompanyModel = mongoose.model("Company", companySchema);

class CompanyController {

    async fetchGeminiAnalysis(prompt) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("Missing GEMINI_API_KEY in environment variables.");

        try {
            const response = await axios.post(
                "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent",
                {
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.8,
                        topP: 0.8,
                        maxOutputTokens: 100
                    }
                },
                { headers: { "Content-Type": "application/json" }, params: { key: apiKey } }
            );
            return response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
        } catch (error) {
            console.error("Gemini API Error:", error.response?.data || error.message);
            throw new Error("Failed to fetch analysis from Gemini.");
        }
    }

    async getRedditAnalysis(req, res) {
        const { companyName } = req.params;
        const cacheKey = `reddit:${companyName}`;

        try {
            const cachedData = await redisClient.get(cacheKey);
            if (cachedData) {
                console.log("Serving Reddit analysis from cache");
                return res.json({ summary: JSON.parse(cachedData), source: "Reddit" });
            }

            const prompt = `Analyze the most recent Reddit posts about ${companyName} stock. Summarize sentiment, trends, key user arguments, and predictions from specific subreddits like r/stocks, r/investing, and r/WallStreetBets. Mention users or subreddits where possible. Deliver exactly 5 concise bullet points. No disclaimers or chatbot language.`;

            const summary = await this.fetchGeminiAnalysis(prompt);
            await redisClient.setEx(cacheKey, 3600, JSON.stringify(summary));

            res.json({ summary, source: "Reddit" });
        } catch (error) {
            res.status(500).send(error.message);
        }
    }

    async getSECAnalysis(req, res) {
        const { companyName } = req.params;
        const cacheKey = `sec:${companyName}`;

        try {
            const cachedData = await redisClient.get(cacheKey);
            if (cachedData) {
                console.log("Serving SEC analysis from cache");
                return res.json({ summary: JSON.parse(cachedData), source: "SEC Filings" });
            }

            const prompt = `Summarize the most recent SEC filings for ${companyName}, including forms 10-K, 10-Q, and 8-K. Focus on earnings changes, new risk factors, and significant disclosures. Provide exactly 5 sharp, specific bullet points. Avoid disclaimers, chatbot language, and introductions.`;

            const summary = await this.fetchGeminiAnalysis(prompt);
            await redisClient.setEx(cacheKey, 3600, JSON.stringify(summary));

            res.json({ summary, source: "SEC Filings" });
        } catch (error) {
            res.status(500).send(error.message);
        }
    }

    async getTwitterAnalysis(req, res) {
        const { companyName } = req.params;
        const cacheKey = `twitter:${companyName}`;

        try {
            const cachedData = await redisClient.get(cacheKey);
            if (cachedData) {
                console.log("Serving Twitter analysis from cache");
                return res.json({ summary: JSON.parse(cachedData), source: "Twitter" });
            }

            const prompt = `Summarize the latest Twitter sentiment about ${companyName}. Include tweets from verified investors, trending hashtags, and significant mentions from influential accounts. Reference usernames where possible. Deliver exactly 5 sharp bullet points. No intros, disclaimers, or chatbot filler.`;

            const summary = await this.fetchGeminiAnalysis(prompt);
            await redisClient.setEx(cacheKey, 3600, JSON.stringify(summary));

            res.json({ summary, source: "Twitter" });
        } catch (error) {
            res.status(500).send(error.message);
        }
    }

    async getWallStreetAnalysis(req, res) {
        const { companyName } = req.params;
        const cacheKey = `wsb:${companyName}`;

        try {
            const cachedData = await redisClient.get(cacheKey);
            if (cachedData) {
                console.log("Serving WSB analysis from cache");
                return res.json({ summary: JSON.parse(cachedData), source: "WallStreetBets" });
            }

            const prompt = `Summarize the current WallStreetBets discussions about ${companyName}. Focus on top posts, popular memes, investment sentiment, and individual user positions. Mention usernames and post titles where relevant. Provide exactly 5 bold, specific bullet points. No disclaimers or chatbot introductions.`;

            const summary = await this.fetchGeminiAnalysis(prompt);
            await redisClient.setEx(cacheKey, 3600, JSON.stringify(summary));

            res.json({ summary, source: "WallStreetBets" });
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
                        contents: [{
                            parts: [{
                                text: `What is the exact stock ticker symbol for the company "${name}"? Reply ONLY with the ticker symbol. No other words.`
                            }]
                        }],
                        generationConfig: { temperature: 0, maxOutputTokens: 10 }
                    },
                    { headers: { "Content-Type": "application/json" }, params: { key: apiKey } }
                );

                tikkr = response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "UNKNOWN";
            } catch (error) {
                console.error("Gemini API Error fetching ticker:", error.message);
            }

            const newCompany = new CompanyModel({ name, date: new Date(date), noOfShares, email, tikkr });
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
