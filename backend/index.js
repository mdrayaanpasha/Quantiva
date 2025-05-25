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

const app = express();
app.use(cors())
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

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: { user: process.env.EMAIL, pass: process.env.EMAIL_PASS },
});



//  = = = = = = SUBSCRIPTION BASED = = = = == 

app.get("/subscriptions", verifyToken, async (req, res) => {
  try {
    const email = req.user.email;
    const subscriptions = await Subscription.find({ subscriber_email: email }).select("company -_id");

    res.json({ subscriptions: subscriptions.map(sub => sub.company) });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});


app.post("/subscribe", verifyToken, async (req, res) => {
  try {
    let { company } = req.body;
    const email = req.user.email;

    if (!company || typeof company !== "string" || company.trim().length < 2) {
      return res.status(400).json({ error: "Invalid company name" });
    }

    company = company.trim().toLowerCase();

    // Insert directly, let MongoDB handle duplicates
    const newSubscription = new Subscription({ company, subscriber_email: email });

    await newSubscription.save();
    res.json({ message: "Subscribed successfully" });

  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "Already subscribed to this company" });
    }
    res.status(500).json({ error: "Server error" });
  }
});


// = = = = = = AUTH = = = = = =

app.use("/api/auth", AuthRouter);


// = = =  = Investments = = = = = 
app.use("/api/investments", investmentRouter);

app.post("/investment-bad-analysis", async (req, res) => {
  const { companies } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) return res.status(500).send("Missing API Key");
  if (!companies || !Array.isArray(companies) || companies.length === 0) {
    return res.status(400).send("Invalid company list");
  }

  try {
    const prompt = `
        Analyze the financial performance of the following companies: ${companies.join(", ")}, from recent wall street journals and reddit posts and tell me which of the given companies are bad performing, just give me them and why are they bad performing, based on reddit and wall street analysis nothing else, make it minimalist.`;

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
    console.log(generatedText)
    res.json({ analysis: generatedText });
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    res.status(500).send("Failed to fetch analysis");
  }
});

app.post("/investment-good-analysis", async (req, res) => {
  const { companies } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) return res.status(500).send("Missing API Key");
  if (!companies || !Array.isArray(companies) || companies.length === 0) {
    return res.status(400).send("Invalid company list");
  }

  try {
    const prompt = `
      Analyze the financial performance of the following companies: ${companies.join(", ")}, from recent wall street journals and reddit posts and tell me which of the given companies are good performing, just give me them and why are they good performing, based on reddit and wall street analysis nothing else make it minimalist.`;

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
    console.log(generatedText)
    res.json({ analysis: generatedText });
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    res.status(500).send("Failed to fetch analysis");
  }
});

app.post("/fetchStockPrices", async (req, res) => {
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

        console.log(stock)

      } catch (err) {
        console.error(`Error fetching data for ${stock.name}:`, err.message);
      }
    }

    if (stockData.length === 0) {
      return res.status(404).json({ error: "No valid stock data found" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
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
      res.send({ textAnlaysis: botResponse, Numerical: stockData })

    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      res.status(500).json({ error: "Failed to fetch response from Gemini" });
    }




  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// = = = COMPANIES = = = = 

app.get("/api/getReddit/:companyName", async (req, res) => {
  const { companyName } = req.params;
  const prompt = `Summarize recent Reddit discussions on ${companyName}'s stock: trends, sentiment, and hot takes. make the response concise and to the point while personalizing the experience, dont generlize mention which source said what, overall be concise and minimalist and proffessional`;
  const summary = await fetchGeminiAnalysis(prompt);
  res.json({ summary });
});

app.get("/api/getSEC/:companyName", async (req, res) => {
  const { companyName } = req.params;
  const prompt = `Summarize the latest SEC filings for ${companyName}. Focus on earnings, risks, and major disclosures. make the response concise and to the point while personalizing the experience, dont generlize mention which source said what, overall be concise and minimalist and proffessional`;
  const summary = await fetchGeminiAnalysis(prompt);
  res.json({ summary });
});

app.get("/api/getTwitter/:companyName", async (req, res) => {
  const { companyName } = req.params;
  const prompt = `Summarize Twitter sentiment on ${companyName}: major tweets, investor opinions, and trending topics. make the response concise and to the point while personalizing the experience, dont generlize mention which source said what, overall be concise and minimalist and proffessional`;
  const summary = await fetchGeminiAnalysis(prompt);
  res.json({ summary });
});

app.get("/api/getwallstreet/:companyName", async (req, res) => {
  const { companyName } = req.params;
  const prompt = `Summarize discussions on WallStreetBets about ${companyName}: memes, speculation, and market outlook. make the response concise and to the point while personalizing the experience, dont generlize mention which source said what, overall be concise and minimalist and proffessional`;
  const summary = await fetchGeminiAnalysis(prompt);
  res.json({ summary });
});


app.post("/addCompany", verifyToken, async (req, res) => {
  try {
    const { name, date, noOfShares } = req.body;

    if (!req.user || !req.user.email) {
      return res.status(401).json({ error: "Unauthorized: Email missing in token" });
    }

    const email = req.user.email; // Extracted from JWT
    console.log("User email from token:", email);

    // Fetch ticker symbol from Gemini
    let tikkr = "UNKNOWN"; // Default ticker

    try {
      const apiKey = process.env.GEMINI_API_KEY; // Store API key in env

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

      tikkr = response.data?.candidates?.[0]?.content?.trim() || "UNKNOWN"; // Extract and clean ticker symbol
    } catch (error) {
      console.error("Gemini API Error:", error.message);
    }

    // Save company with fetched ticker symbol
    const newCompany = new CompanyModel({
      name,
      date: new Date(date), // Convert string to Date object
      noOfShares,
      email,
      tikkr, // Store ticker symbol
    });

    await newCompany.save();
    res.status(201).json({ message: "Company added successfully", tikkr });
  } catch (error) {
    console.error("Database Save Error:", error);
    res.status(500).json({ error: "Failed to add company", details: error.message });
  }
});

app.get("/companies", verifyToken, async (req, res) => {
  try {
    const companies = await CompanyModel.find({ email: req.user.email });
    res.json(companies);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});


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
