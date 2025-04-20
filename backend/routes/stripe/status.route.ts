import { Stripe } from "stripe";
import express from "express";
import { neon } from '@neondatabase/serverless';
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const renderUrl = 'https://openplay-4o4a.onrender.com';

router.post("/status", async (req, res) => {
    const { connectedAccountId } = req.body;

    if (!connectedAccountId) return res.status(400).json({ error: "Missing account ID" });

    try {
        const account = await stripe.accounts.retrieve(connectedAccountId);

        if (!account.charges_enabled) {
        const accountLink = await stripe.accountLinks.create({
            account: connectedAccountId,
            refresh_url: `${renderUrl}/api/stripe-redirect?status=refresh`,
            return_url:  `${renderUrl}/api/stripe-redirect?status=success`,
            type: "account_onboarding",
        });

        return res.json({
            status: "restricted",
            onboardingLink: accountLink.url,
        });
        }

        return res.json({ status: "enabled" });
    } catch (error) {
        console.error("Stripe account status error:", error);
        res.status(500).json({ error: "Failed to fetch Stripe account status" });
    }
});
  
export default router;