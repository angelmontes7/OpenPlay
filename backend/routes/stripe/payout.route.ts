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

    // 1 Look up users connected account id
    const result = await sql`
      SELECT connected_account_id
      FROM users
      WHERE clerk_id = ${clerkId}
    `;

    if (result.length === 0) {
      return res.status(400).json({ error: "Connected account not found" });
    }

    // 2 Check platform balance to make sure there is enough funds
    const { available } = await stripe.balance.retrieve();
    const usdAvailable = available.find(b => b.currency === "usd")?.amount || 0;
    const totalWithdrawCents = Math.round(parseFloat(amount) * 100);
    const userReceivesCents = Math.floor(totalWithdrawCents * 0.99); // 99% to user
    const companyFeeCents = totalWithdrawCents - userReceivesCents; // 1% to company

    if (usdAvailable < totalWithdrawCents) {
      return res.status(400).json({ error: "Insufficient platform funds" });
    }
    
    // 3 Check if user has a bank account on file in their express/stripe account
    const connectedAccountId = result[0].connected_account_id;
    const account = await stripe.accounts.retrieve(connectedAccountId);
    if (!account.external_accounts || account.external_accounts.data.length === 0) {
      return res.status(400).json({ needs_bank_account: true, error: "No bank account on file" });
    }

    // 4 Transfer 99% of funds to users Stripe account
    const transfer = await stripe.transfers.create({
      amount: userReceivesCents,
      currency: "usd",
      destination: connectedAccountId
    })
  
    // 5 manually pay user out right away instead of using stripes cycle
    const payout = await stripe.payouts.create(
      {
        amount: userReceivesCents,
        currency: "usd",
      },
      {
        stripeAccount: connectedAccountId, // critical line!
      }
    );

    // 6 Update DB ledger: subtract from user
    await sql`
      UPDATE user_balances
      SET balance = balance - ${amount}
      WHERE clerk_id = ${clerkId}
    `;

    // 7. Log company fee
    await sql`
      INSERT INTO company_revenue (
        source,
        amount,
        currency,
        description,
        user_clerk_id,
        created_at
      ) VALUES (
        'withdrawal fee',
        ${companyFeeCents / 100},
        'USD',
        '1% fee from user withdrawal of $${(totalWithdrawCents / 100)}',
        ${clerkId},
        NOW()
      )
    `;

    return res.status(200).json({ transfer, payout });
  } catch (error) {
    console.error("Error in POST /api/payout:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;