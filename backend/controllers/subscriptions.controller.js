import mongoose from "mongoose";
import redis from "redis";
import SubscriptionSchema from "../schemas/subscriptionSchema.js";

const Subscription = mongoose.model("Subscription", SubscriptionSchema);

// Redis setup
const redisClient = redis.createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379"
});

redisClient.connect().catch(console.error);

class SubscriptionController {

    async getSubscriptions(req, res) {
        try {
            if (!req.user || !req.user.email) {
                return res.status(401).json({ error: "Unauthorized: Email missing in token" });
            }

            const email = req.user.email.trim().toLowerCase();
            const cacheKey = `subscriptions:${email}`;

            const cachedData = await redisClient.get(cacheKey);
            if (cachedData) {
                console.log("Serving subscriptions from cache");
                return res.json({ subscriptions: JSON.parse(cachedData), source: "Redis Cache" });
            }

            const subscriptions = await Subscription.find({ subscriber_email: email }).select("company -_id");
            const companyList = subscriptions.map(sub => sub.company);

            await redisClient.setEx(cacheKey, 600, JSON.stringify(companyList));

            res.json({ subscriptions: companyList, source: "Database" });
        } catch (err) {
            console.error("Error fetching subscriptions:", err);
            res.status(500).json({ error: "Server error fetching subscriptions" });
        }
    }

    async subscribeToCompany(req, res) {
        try {
            let { company } = req.body;

            if (!req.user || !req.user.email) {
                return res.status(401).json({ error: "Unauthorized: Email missing in token" });
            }

            if (!company || typeof company !== "string" || company.trim().length < 2) {
                return res.status(400).json({ error: "Invalid company name provided" });
            }

            company = company.trim().toLowerCase();
            const email = req.user.email.trim().toLowerCase();

            const existingSubscription = await Subscription.findOne({ company, subscriber_email: email });
            if (existingSubscription) {
                return res.status(400).json({ error: "Already subscribed to this company" });
            }

            const newSubscription = new Subscription({ company, subscriber_email: email });
            await newSubscription.save();

            // Invalidate Redis cache for this user
            const cacheKey = `subscriptions:${email}`;
            await redisClient.del(cacheKey);

            res.json({ message: `Successfully subscribed to ${company}` });
        } catch (err) {
            console.error("Error subscribing to company:", err);
            res.status(500).json({ error: "Server error during subscription" });
        }
    }
}

export default new SubscriptionController();
