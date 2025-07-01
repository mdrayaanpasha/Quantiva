import express from "express";
import mongoose from "mongoose";
import axios from "axios";
import dotenv from "dotenv";
import yahooFinance from "yahoo-finance2";
import redis from "redis";
import crypto from "crypto";

dotenv.config();

const redisClient = redis.createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379"
});

redisClient.connect().catch(console.error);

import userSchema from "../schemas/userSchema.js";
import SubscriptionSchema from "../schemas/subscriptionSchema.js";
import companySchema from "../schemas/companySchema.js";

const User = mongoose.model("User", userSchema);
const Subscription = mongoose.model("Subscription", SubscriptionSchema);
const CompanyModel = mongoose.model("Company", companySchema);

class InvestmentsController {

    async badInvestmentAnalysis(req, res) {
        const { companies } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) return res.status(500).send("Missing API Key");
        if (!companies || !Array.isArray(companies) || companies.length === 0) {
            return res.status(400).send("Invalid company list");
        }

        const cacheKey = `badInvest:${crypto.createHash('md5').update(JSON.stringify(companies)).digest('hex')}`;

        try {
            const cachedData = await redisClient.get(cacheKey);
            if (cachedData) {
                console.log("Serving from Redis cache");
                return res.json({ analysis: JSON.parse(cachedData), source: "WSJ & Reddit" });
            }

            const prompt = `Analyze the financial performance of these companies: ${companies.join(", ")} using recent Wall Street Journal articles and Reddit posts. Identify underperformers and explain why, citing exact articles, posts, or user discussions when possible. Deliver exactly 5 sharp bullet points. No fluff or disclaimers.`;

            const response = await axios.post(
                "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent",
                {
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.2, topP: 0.8, maxOutputTokens: 100 }
                },
                { headers: { "Content-Type": "application/json" }, params: { key: apiKey } }
            );

            const generatedText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response";

            await redisClient.setEx(cacheKey, 3600, JSON.stringify(generatedText));

            res.json({ analysis: generatedText, source: "WSJ & Reddit" });
        } catch (error) {
            console.error("Error:", error.response?.data || error.message);
            res.status(500).send("Failed to fetch analysis");
        }
    }

    async goodInvestmentAnalysis(req, res) {
        const { companies } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) return res.status(500).send("Missing API Key");
        if (!companies || !Array.isArray(companies) || companies.length === 0) {
            return res.status(400).send("Invalid company list");
        }

        const cacheKey = `goodInvest:${crypto.createHash('md5').update(JSON.stringify(companies)).digest('hex')}`;

        try {
            const cachedData = await redisClient.get(cacheKey);
            if (cachedData) {
                console.log("Serving from Redis cache");
                return res.json({ analysis: JSON.parse(cachedData), source: "WSJ & Reddit" });
            }

            const prompt = `Analyze the financial performance of these companies: ${companies.join(", ")} using recent Wall Street Journal articles and Reddit posts. Identify the strongest performers and explain why, citing specific articles, posts, or key Reddit discussions when possible. Deliver exactly 5 focused bullet points. No disclaimers or intros.`;

            const response = await axios.post(
                "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent",
                {
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.2, topP: 0.8, maxOutputTokens: 100 }
                },
                { headers: { "Content-Type": "application/json" }, params: { key: apiKey } }
            );

            const generatedText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response";

            await redisClient.setEx(cacheKey, 3600, JSON.stringify(generatedText));

            res.json({ analysis: generatedText, source: "WSJ & Reddit" });
        } catch (error) {
            console.error("Error:", error.response?.data || error.message);
            res.status(500).send("Failed to fetch analysis");
        }
    }

    async scoreInvestments(req, res) {
        try {
            const { stocks } = req.body;
            if (!Array.isArray(stocks) || stocks.length === 0) {
                return res.status(400).json({ error: "Invalid stock data format" });
            }

            const cacheKey = `scoreInvest:${crypto.createHash('md5').update(JSON.stringify(stocks)).digest('hex')}`;

            const cachedData = await redisClient.get(cacheKey);
            if (cachedData) {
                console.log("Serving from Redis cache");
                return res.json(JSON.parse(cachedData));
            }

            const today = Math.floor(Date.now() / 1000);
            let stockData = [];

            for (const stock of stocks) {
                try {
                    if (!stock.name || typeof stock.name !== "string") {
                        console.warn(`Skipping invalid stock entry: ${JSON.stringify(stock)}`);
                        continue;
                    }

                    let startDate = new Date(stock.date).getTime() / 1000;
                    if (isNaN(startDate) || startDate >= today) {
                        console.warn(`Invalid date for ${stock.name}: ${stock.date}`);
                        continue;
                    }

                    console.log(`Fetching data for ${stock.name}...`);
                    const result = await yahooFinance.historical(stock.name, {
                        period1: startDate,
                        period2: today,
                        interval: "1d",
                    });

                    if (!result || result.length === 0) {
                        console.warn(`No historical data found for ${stock.name}`);
                        continue;
                    }

                    result.sort((a, b) => new Date(a.date) - new Date(b.date));

                    const purchasePrice = result[0]?.close ?? 0;
                    const latestPrice = result[result.length - 1]?.close ?? 0;
                    const profit = latestPrice - purchasePrice;

                    stockData.push({
                        name: stock.name,
                        price: result,
                        profit: profit.toFixed(2),
                    });

                } catch (err) {
                    console.error(`Error fetching data for ${stock.name}:`, err.message);
                }
            }

            if (stockData.length === 0) {
                return res.status(404).json({ error: "No valid stock data found" });
            }

            const apiKey = process.env.GEMINI_API_KEY;

            const tempStockData = stockData.map(({ price, ...rest }) => rest);

            try {
                const response = await axios.post(
                    "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent",
                    {
                        contents: [{
                            parts: [{
                                text: `Here is my investment data: ${JSON.stringify(tempStockData, null, 2)}. As a portfolio analyst, score each stock out of 100 based on profitability and alignment with Reddit and Twitter market sentiment. Use recent trends, popular opinions, and major influencers to justify the scores. Deliver scores and explanations in bullet points. No intros, disclaimers, or chatbot filler.`
                            }]
                        }],
                    },
                    {
                        headers: { "Content-Type": "application/json" },
                        params: { key: apiKey },
                    }
                );

                const botResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response from Gemini";

                const responseData = { textAnalysis: botResponse, Numerical: stockData, source: "Reddit & Twitter" };

                await redisClient.setEx(cacheKey, 3600, JSON.stringify(responseData));

                res.json(responseData);

            } catch (error) {
                console.error("Error:", error.response?.data || error.message);
                res.status(500).json({ error: "Failed to fetch response from Gemini" });
            }

        } catch (error) {
            console.error("Server error:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
}

export default new InvestmentsController();
