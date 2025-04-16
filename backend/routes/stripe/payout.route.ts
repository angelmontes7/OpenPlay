import { Stripe } from "stripe";
import express from "express";
import { neon } from '@neondatabase/serverless';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

router.post("/", async (req, res) => {
  try {
    const { clerkId, amount, destination } = req.body;

    if (!clerkId || !amount || !destination) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    // Create a payout
    const payout = await stripe.payouts.create({
      amount: parseInt(amount) * 100, // Amount in cents
      currency: "usd",
      destination: destination,
    });

    // Update the user's balance in the database
    const sql = neon(`${process.env.DATABASE_URL}`);
    await sql`
      UPDATE user_balances
      SET balance = balance - ${amount}
      WHERE clerk_id = ${clerkId}
    `;

    return res.status(200).json({ payout });
  } catch (error) {
    console.error("Error in POST /api/payout:", error);
    return res.status(500).json({ error: "Internal Server Error" })
  }
});

export default router;