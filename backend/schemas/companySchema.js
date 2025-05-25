import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
    name: { type: String, required: true },
    date: { type: Date, required: true },
    noOfShares: { type: Number, required: true },
    email: { type: String, required: true }, // Extracted from JWT
    TIKR: String,
});

export default companySchema