// = = = = = ENVIRONMENT CONFIGURATION = = = = = 
import dotenv from "dotenv";
dotenv.config();

// = = = = = CORE & THIRD-PARTY IMPORTS = = = = = 
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import axios from "axios";
import yahooFinance from "yahoo-finance2";
import bcrypt from "bcrypt";

// = = = = = SCHEMA IMPORTS = = = = = 
import userSchema from "./schemas/userSchema.js";
import SubscriptionSchema from "./schemas/subscriptionSchema.js";
import companySchema from "./schemas/companySchema.js";

// = = = = = ROUTER IMPORTS = = = = = 
import AuthRouter from "./routers/auth.router.js";
import investmentRouter from "./routers/investment.router.js";
import companiesRouter from "./routers/companies.router.js";
import subscriptionRouter from "./routers/subscriptions.router.js";
import otherRouter from "./routers/other.router.js";

// = = = = = APP INITIALIZATION = = = = = 
const app = express();
const PORT = process.env.PORT || 5000;

// = = = = = MIDDLEWARE = = = = = 
app.use(cors({
  origin: "*", // Allow all origins — frontend, mobile, Postman, whoever
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.options("*", cors());

app.use(morgan("dev"));
app.use(express.json());

// = = = = = DATABASE CONNECTION = = = = = 
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// = = = = = MODEL INITIALIZATION = = = = = 
const User = mongoose.model("User", userSchema);
const Company = mongoose.model("Company", companySchema);
const Subscription = mongoose.model("Subscription", SubscriptionSchema);

// = = = = = ROUTES = = = = = 
app.use("/api/auth", AuthRouter);                // Authentication routes
app.use("/api/investments", investmentRouter);   // Investment-related routes
app.use("/api/companies", companiesRouter);      // Company info routes
app.use("/api/subscriptions", subscriptionRouter); // Subscription logic
app.use("/api/others", otherRouter);             // Miscellaneous endpoints

// = = = = = SERVER START = = = = = 
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
