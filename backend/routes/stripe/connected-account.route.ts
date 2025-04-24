import { Stripe } from "stripe";
import { neon } from '@neondatabase/serverless';
import express from "express";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const renderUrl = 'https://openplay-4o4a.onrender.com';

router.post("/", async (req, res) => {
  try {
    const { clerkId, email } = req.body;

    console.log("clerkId:", clerkId, "email:", email);

    if (!clerkId || !email) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    // Create a connected account
    const account = await stripe.accounts.create({
      type: "express",
      country: 'US',
      email: email,
      capabilities: {
        transfers: { requested: true },
      },
      settings: {
        payouts: {
          schedule: {
            interval: 'manual',
          },
        },
      },
    });

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${renderUrl}/api/stripe-redirect?status=refresh`,
      return_url:  `${renderUrl}/api/stripe-redirect?status=success`,
      type: 'account_onboarding'
    });
 
    // Store the connected account ID in your database
    const sql = neon(`${process.env.DATABASE_URL}`);
    await sql`
      UPDATE users
      SET connected_account_id = ${account.id}
      WHERE clerk_id = ${clerkId}
    `;

    return res.status(200).json({ accountId: account.id, onboardingLink: accountLink.url });
  } catch (error) {
    console.error("POST /connected-account error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get('/', async(req, res) => {
  try {
    const { clerkId } = req.query

    if (!clerkId) {
      return res.status(400).json({ error: "Missing Clerk ID" });
    }

    const sql = neon(`${process.env.DATABASE_URL}`);
    const result = await sql`
      SELECT connected_account_id
      FROM users
      WHERE clerk_id = ${clerkId}
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: "Connected account ID not found" });
    }

    return res.status(200).json({ connected_account_id: result[0].connected_account_id });
  } catch (error) {
    console.error("Error in GET /api/connected-account:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;