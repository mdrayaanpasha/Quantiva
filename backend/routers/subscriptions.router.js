import express from 'express';
import SubscriptionController from '../controllers/subscriptions.controller.js'; // Adjust path if needed
import { verifyToken } from '../services/util.js';

const subscriptionRouter = express.Router();

subscriptionRouter.get("/subscriptions", verifyToken, SubscriptionController.getSubscriptions.bind(SubscriptionController));
subscriptionRouter.post("/subscribe", verifyToken, SubscriptionController.subscribeToCompany.bind(SubscriptionController));

export default subscriptionRouter;