import express from "express";
import mongoose from "mongoose";
import axios from "axios";
import dotenv from "dotenv";
import yahooFinance from "yahoo-finance2";

dotenv.config();

import userSchema from "../schemas/userSchema.js";
import SubscriptionSchema from "../schemas/subscriptionSchema.js";
import companySchema from "../schemas/companySchema.js";

const User = mongoose.model("User", userSchema);
const Subscription = mongoose.model("Subscription", SubscriptionSchema);
const CompanyModel = mongoose.model("Company", companySchema);

class InvestmentsController {
    async badInvestMentAnalysis(req, res) {
        const { companies } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) return res.status(500).send("Missing API Key");
        if (!companies || !Array.isArray(companies) || companies.length === 0) {
            return res.status(400).send("Invalid company list");
        }

        try {
            const prompt = `Analyze the financial performance of the following companies: ${companies.join(", ")}, from recent wall street journals and reddit posts. Tell me which of the given companies are bad performing, why they are bad performing, based only on reddit and wall street analysis. Make it minimalist.`;

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

            const generatedText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
            console.log(generatedText);
            res.json({ analysis: generatedText });
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

        try {
            const prompt = `Analyze the financial performance of the following companies: ${companies.join(", ")}, from recent wall street journals and reddit posts. Tell me which of the given companies are good performing, why they are good performing, based only on reddit and wall street analysis. Make it minimalist.`;

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

            const generatedText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
            console.log(generatedText);
            res.json({ analysis: generatedText });
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

                    console.log(`Workspaceing data for ${stock.name}...`);
                    // Ensure yahooFinance is correctly imported and used
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

                    console.log(stock);

                } catch (err) {
                    console.error(`Error fetching data for ${stock.name}:`, err.message);
                }
            }

            if (stockData.length === 0) {
                return res.status(404).json({ error: "No valid stock data found" });
            }

            const apiKey = process.env.GEMINI_API_KEY;
            // Removed fetchGeminiAnalysis since it was unused and the axios call is directly inlined
            const tempStockData = stockData.map(({ price, ...rest }) => rest);
            console.log("tempstock", tempStockData);

            try {
                const response = await axios.post(
                    "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent",
                    {
                        contents: [{
                            parts: [{
                                "text": `${JSON.stringify(tempStockData, null, 2)} — these were my investments, imagine you are an investment portfolio analyst, score my stocks out of 100, and also tell me how it aligns with recent trends in stock market based on reddit and twitter trends `
                            }]
                        }],
                    },
                    {
                        headers: { "Content-Type": "application/json" },
                        params: { key: apiKey },
                    }
                );

                const botResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response from Gemini";
                res.send({ textAnlaysis: botResponse, Numerical: stockData });

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