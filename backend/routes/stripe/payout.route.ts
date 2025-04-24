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

    // 1 Look up users connected account id
    const sql = neon(`${process.env.DATABASE_URL}`);
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
    const withdrawCents = Math.round(parseFloat(amount) * 100);
    if (usdAvailable < withdrawCents) {
      return res.status(400).json({ error: "Insufficient platform funds" });
    }
    console.log("Platform balance: ", available)
    // 3 Check if user has a bank account on file in their express/stripe account
    const connectedAccountId = result[0].connected_account_id;
    const account = await stripe.accounts.retrieve(connectedAccountId);
    if (!account.external_accounts || account.external_accounts.data.length === 0) {
      return res.status(400).json({ needs_bank_account: true, error: "No bank account on file" });
    }

    // 4 Transfer money from platform balance into user express account
    const balance = await stripe.balance.retrieve({
      stripeAccount: connectedAccountId,
    });
    
    console.log("Connected Account Balance before transfer:", balance);
    const transfer = await stripe.transfers.create({
      amount: withdrawCents,
      currency: "usd",
      destination: connectedAccountId
    })

    console.log("Connected Account Balance after transfer:", balance);
  
    // manually pay user out right away instead of using stripes cycle
    const payout = await stripe.payouts.create(
      {
        amount: withdrawCents,
        currency: "usd",
      },
      {
        stripeAccount: connectedAccountId, // critical line!
      }
    );

    // 5 Update DB ledger: subtract from user
    await sql`
      UPDATE user_balances
      SET balance = balance - ${amount}
      WHERE clerk_id = ${clerkId}
    `;

    return res.status(200).json({ transfer, payout });
  } catch (error) {
    console.error("Error in POST /api/payout:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;