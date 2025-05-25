import express from "express";
import mongoose from "mongoose";
import jwt, { decode } from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import cors from "cors";
import axios from "axios";
import yahooFinance from "yahoo-finance2";
import morgan from "morgan";
import bcrypt from "bcrypt";
dotenv.config();


import userSchema from "./schemas/userSchema.js";
import SubscriptionSchema from "./schemas/subscriptionSchema.js";
import companySchema from "./schemas/companySchema.js";
import AuthRouter from "./routers/auth.router.js";
import investmentRouter from "./routers/investment.router.js";
import companiesRouter from "./routers/companies.router.js";
import subscriptionRouter from "./routers/subscriptions.router.js";

const app = express();
app.use(cors({
  origin: "*", // Allow all origins — frontend, mobile, Postman, whoever
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.options("*", cors());
app.use(morgan('dev')); // or 'combined'
app.use(express.json());
const apiKey = process.env.GEMINI_API_KEY;

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));


// Company Schema
const CompanyModel = mongoose.model("Company", companySchema);
const Subscription = mongoose.model("Subscription", SubscriptionSchema);
const User = mongoose.model("User", userSchema);






const verifyToken = (req, res, next) => {
  const token = req.header("Authorization");


  if (!token) return res.status(401).json({ error: "Unauthorized: No token provided" });

  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
    req.user = decoded;  // Attach decoded user info to `req.user`
    next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};


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




//  = = = = = = SUBSCRIPTION BASED = = = = == 



app.use("/api/subscriptions", subscriptionRouter);


// = = = = = = AUTH = = = = = =

app.use("/api/auth", AuthRouter);


// = = =  = Investments = = = = = 
app.use("/api/investments", investmentRouter);




// = = = COMPANIES = = = = 

app.use("/api/companies", companiesRouter);


// = = = OTHERS = = = = 

app.post("/alert-short", async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) return res.status(500).send("Missing API Key");

  const companies = req.body.companies;
  console.log(companies)




  try {
    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent",
      {
        contents: [
          {
            parts: [
              {
                text: `Fetch real-time data from Wall Street, Reddit, and X posts to analyze my invested ${companies}. Provide a 15-word summary on which are likely to decline and why, based on the latest sentiment and market trends.`
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

    const generatedText =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
    res.json({ summary: generatedText });
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    res.status(500).send("Failed to fetch data");
  }
});

app.post("/api/chat", async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) return res.status(500).send("Missing API Key");

  const userMessage = req.body.query;
  const company = req.body.company;

  console.log("User Input:", userMessage, "Company Name: ", company);

  try {
    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent",
      {
        contents: [{ parts: [{ "text": `${userMessage} (User's message). Now, analyze the situation of ~${company} with a **concise, minimalist, and non-generic response**. The response should incorporate insights from **Reddit sentiment**, **SEC filings**, **Wall Street Journal**, **Bloomberg**, and other relevant sources. The goal is to provide **actionable intelligence**—not vague suggestions—so the user can make an informed decision. Avoid telling the user to consult a professional; assume they are assessing the model independently., let the response be binary yes or no. with some explanation on why.` }] }],
      },
      {
        headers: { "Content-Type": "application/json" },
        params: { key: apiKey },
      }
    );

    const botResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response from Gemini";
    res.json({ response: botResponse });
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch response from Gemini" });
  }
});


app.listen(5000, () => console.log("Server running on port 5000"));
