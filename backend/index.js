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
import otherRouter from "./routers/other.router.js";

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










//  = = = = = = SUBSCRIPTION BASED = = = = == 



app.use("/api/subscriptions", subscriptionRouter);


// = = = = = = AUTH = = = = = =

app.use("/api/auth", AuthRouter);


// = = =  = Investments = = = = = 
app.use("/api/investments", investmentRouter);




// = = = COMPANIES = = = = 

app.use("/api/companies", companiesRouter);


// = = = OTHERS = = = = 

app.use("/api/others", otherRouter);




app.listen(5000, () => console.log("Server running on port 5000"));
