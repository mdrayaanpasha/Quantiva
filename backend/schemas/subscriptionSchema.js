import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema({
    company: { type: String, required: true, trim: true, lowercase: true },
    subscriber_email: { type: String, required: true, trim: true, lowercase: true },
}, { timestamps: true });

SubscriptionSchema.index({ company: 1, subscriber_email: 1 }, { unique: true });
export default SubscriptionSchema