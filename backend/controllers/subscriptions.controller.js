import mongoose from "mongoose";
import SubscriptionSchema from "../schemas/subscriptionSchema.js";

const Subscription = mongoose.model("Subscription", SubscriptionSchema);

class SubscriptionController {
    async getSubscriptions(req, res) {
        try {
            if (!req.user || !req.user.email) {
                return res.status(401).json({ error: "Unauthorized: Email missing in token" });
            }

            const email = req.user.email;
            const subscriptions = await Subscription.find({ subscriber_email: email }).select("company -_id");

            res.json({ subscriptions: subscriptions.map(sub => sub.company) });
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

            const email = req.user.email;

            if (!company || typeof company !== "string" || company.trim().length < 2) {
                return res.status(400).json({ error: "Invalid company name provided" });
            }

            company = company.trim().toLowerCase();
            const newSubscription = new Subscription({ company, subscriber_email: email });

            await newSubscription.save();
            res.json({ message: "Subscribed successfully" });

        } catch (err) {
            if (err.code === 11000) {
                return res.status(400).json({ error: "Already subscribed to this company" });
            }
            console.error("Error subscribing to company:", err);
            res.status(500).json({ error: "Server error during subscription" });
        }
    }
}

export default new SubscriptionController();