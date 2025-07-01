import axios from 'axios';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import redis from 'redis';
import { verifyToken } from '../services/util.js';

// Redis setup
const redisClient = redis.createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379"
});

redisClient.connect().catch(console.error);

class otherController {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY;
        this.jwtSecret = process.env.JWT_SECRET;

        if (!this.apiKey) console.error("GEMINI_API_KEY is not set.");
        if (!this.jwtSecret) console.error("JWT_SECRET is not set.");
    }

    async alertShort(req, res) {
        if (!this.apiKey) return res.status(500).send("Missing API Key");

        const { companies } = req.body;
        console.log("Companies for alert-short:", companies);

        const cacheKey = `alertShort:${crypto.createHash('md5').update(JSON.stringify([...companies].sort())).digest('hex')}`;

        try {
            const cachedData = await redisClient.get(cacheKey);
            if (cachedData) {
                console.log("Serving alertShort from cache");
                return res.json({ summary: JSON.parse(cachedData), source: "Wall Street, Reddit, X" });
            }

            const response = await axios.post(
                "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent",
                {
                    contents: [{
                        parts: [{
                            text: `Using real-time insights from Wall Street, Reddit, and X, analyze my investments in ${companies.join(", ")}. Identify stocks likely to decline based on current sentiment, trends, and market narratives. Provide exactly 3 sharp bullet points with sources or referenced discussions. No intros, no disclaimers, no filler.`
                        }]
                    }],
                    generationConfig:
                    {
                        "temperature": 0.8,
                        "topP": 0.9,
                        "maxOutputTokens": 100,
                        "presencePenalty": 0.7,
                        "frequencyPenalty": 0.7
                    }
                },
                { headers: { "Content-Type": "application/json" }, params: { key: this.apiKey } }
            );

            const generatedText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response";

            await redisClient.setEx(cacheKey, 3600, JSON.stringify(generatedText));

            res.json({ summary: generatedText, source: "Wall Street, Reddit, X" });
        } catch (error) {
            console.error("Error in alertShort:", error.response?.data || error.message);
            res.status(500).send("Failed to fetch data");
        }
    }

    async chat(req, res) {
        if (!this.apiKey) return res.status(500).send("Missing API Key");

        const { query: userMessage, company } = req.body;
        console.log("User Input:", userMessage, "Company Name:", company);

        const cacheKey = `chat:${crypto.createHash('md5').update(userMessage + company).digest('hex')}`;

        try {
            const cachedData = await redisClient.get(cacheKey);
            if (cachedData) {
                console.log("Serving chat response from cache");
                return res.json({ response: JSON.parse(cachedData), source: "Reddit, SEC, WSJ, Bloomberg" });
            }

            const response = await axios.post(
                "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent",
                {
                    contents: [{
                        parts: [{
                            text: `${userMessage} (User's message). Analyze ${company} and deliver a concise, decision-oriented answer using insights from Reddit sentiment, SEC filings, Wall Street Journal, Bloomberg, and major investor conversations. Provide a 'Yes' or 'No' decision with 1-2 sentence justification. No intros, disclaimers, or chatbot language. Reference specific posts, articles, or filings when possible.`
                        }]
                    }],
                    generationConfig:
                    {
                        "temperature": 0.8,
                        "topP": 0.9,
                        "maxOutputTokens": 100,
                        "presencePenalty": 0.7,
                        "frequencyPenalty": 0.7
                    }
                },
                { headers: { "Content-Type": "application/json" }, params: { key: this.apiKey } }
            );

            const botResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response from Gemini";

            await redisClient.setEx(cacheKey, 3600, JSON.stringify(botResponse));

            res.json({ response: botResponse, source: "Reddit, SEC, WSJ, Bloomberg" });
        } catch (error) {
            console.error("Error in chat:", error.response?.data || error.message);
            res.status(500).json({ error: "Failed to fetch response from Gemini" });
        }
    }
}

export default new otherController();
