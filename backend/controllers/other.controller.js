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
                                    text: `Workspace real-time data from Wall Street, Reddit, and X posts to analyze my invested ${companies}. Provide a 15-word summary on which are likely to decline and why, based on the latest sentiment and market trends.`
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
                    contents: [{ parts: [{ "text": `${userMessage} (User's message). Now, analyze the situation of ~${company} with a **concise, minimalist, and non-generic response**. The response should incorporate insights from **Reddit sentiment**, **SEC filings**, **Wall Street Journal**, **Bloomberg**, and other relevant sources. The goal is to provide **actionable intelligence**—not vague suggestions—so the user can make an informed decision. Avoid telling the user to consult a professional; assume they are assessing the model independently., let the response be binary yes or no. with some explanation on why.` }] }],
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