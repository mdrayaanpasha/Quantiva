import axios from "axios";
import jwt from "jsonwebtoken";

const apiKey = process.env.GEMINI_API_KEY;

const fetchGeminiAnalysis = async (prompt) => {
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
        console.error("Error fetching Gemini API data:", error.response?.data || error.message);
        return "Failed to fetch data";
    }
};

const verifyToken = (req, res, next) => {
    const token = req.header("Authorization");

    if (!token) return res.status(401).json({ error: "Unauthorized: No token provided" });

    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
        req.user = decoded;

        next();
    } catch (err) {
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }
};

export { verifyToken, fetchGeminiAnalysis };