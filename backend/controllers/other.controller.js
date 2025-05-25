import axios from 'axios';
import jwt from 'jsonwebtoken';
import { verifyToken } from '../services/util.js';
class otherController {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY;
        this.jwtSecret = process.env.JWT_SECRET;

        if (!this.apiKey) {
            console.error("GEMINI_API_KEY is not set.");
        }
        if (!this.jwtSecret) {
            console.error("JWT_SECRET is not set.");
        }
    }



    async alertShort(req, res) {
        if (!this.apiKey) {
            return res.status(500).send("Missing API Key");
        }

        const { companies } = req.body;
        console.log("Companies for alert-short:", companies);

        try {
            const response = await axios.post(
                "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent",
                {
                    contents: [
                        {
                            parts: [
                                {
                                    text: `Using real-time data from Wall Street, Reddit, and X, analyze my investments in ${companies}. Provide a 15-word summary identifying which are likely to decline and why, based on current sentiment and market trends. No fluff or disclaimers.`
                                },
                            ],
                        },
                    ],
                },
                {
                    headers: { "Content-Type": "application/json" },
                    params: { key: this.apiKey },
                }
            );

            const generatedText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
            res.json({ summary: generatedText });
        } catch (error) {
            console.error("Error in alertShort:", error.response?.data || error.message);
            res.status(500).send("Failed to fetch data");
        }
    };

    async chat(req, res) {
        if (!this.apiKey) {
            return res.status(500).send("Missing API Key");
        }

        const { query: userMessage, company } = req.body;
        console.log("User Input:", userMessage, "Company Name:", company);

        try {
            const response = await axios.post(
                "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent",
                {
                    contents: [{
                        parts: [{
                            text: `${userMessage} (User's message). Analyze ${company} with a concise, minimalist, non-generic response. Use insights from Reddit sentiment, SEC filings, Wall Street Journal, Bloomberg, and other relevant sources. Provide clear, actionable intelligence—yes or no—with brief explanation. No disclaimers or "consult a professional" advice.`
                        }]
                    }]
                },
                {
                    headers: { "Content-Type": "application/json" },
                    params: { key: this.apiKey },
                }
            );

            const botResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response from Gemini";
            res.json({ response: botResponse });
        } catch (error) {
            console.error("Error in chat:", error.response?.data || error.message);
            res.status(500).json({ error: "Failed to fetch response from Gemini" });
        }
    };
}

export default new otherController();