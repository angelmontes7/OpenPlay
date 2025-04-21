import { Stripe } from "stripe";
import express from "express";
import { neon } from '@neondatabase/serverless';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

router.post("/", async (req, res) => {
  try {
    const { clerkId, amount } = req.body;

    if (!clerkId || !amount || isNaN(parseFloat(amount))) {
      return res.status(400).json({ error: "Missing or invalid required fields" });
    }

    const sql = neon(`${process.env.DATABASE_URL}`);
    const result = await sql`
      SELECT connected_account_id
      FROM users
      WHERE clerk_id = ${clerkId}
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: "Connected account not found" });
    }

    const connectedAccountId = result[0].connected_account_id;

    const balance = await stripe.balance.retrieve({
      stripeAccount: connectedAccountId,
    });
    
    console.log("Connected Account Balance:", balance);
    
    // Check for external bank account
    const account = await stripe.accounts.retrieve(connectedAccountId);
    if (!account.external_accounts || account.external_accounts.data.length === 0) {
      return res.status(400).json({ needs_bank_account: true, error: "No bank account on file" });
    }

    // Initiate payout from the connected account's default external account (e.g., bank)
    const payout = await stripe.payouts.create(
      {
        amount: parseInt(amount) * 100,
        currency: "usd",
      },
      {
        stripeAccount: connectedAccountId, // critical line!
      }
    );

    await sql`
      UPDATE user_balances
      SET balance = balance - ${amount}
      WHERE clerk_id = ${clerkId}
    `;

    return res.status(200).json({ payout });
  } catch (error) {
    console.error("Error in POST /api/payout:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;