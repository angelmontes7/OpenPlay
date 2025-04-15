import { neon } from '@neondatabase/serverless';
import express from 'express';

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const sql = neon(`${process.env.DATABASE_URL}`);
        const { clerkId, type, amount } = await req.body;

        if (!clerkId || !type || !amount) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        if (type !== "add" && type !== "subtract") {
            return res.status(400).json({ error: "Invalid transaction type" });
        }

        if (amount <= 0) {
            return res.status(400).json({ error: "Amount must be greater than zero" });
        }

        // Retrieve current balance
        const balanceResult = await sql`
            SELECT balance FROM user_balances WHERE clerk_id = ${clerkId} LIMIT 1;
        `;

        let currentBalance = balanceResult.length > 0 ? balanceResult[0].balance : 0;

        // Ensure currentBalance and amount are numbers
        currentBalance = parseFloat(currentBalance) || 0;
        const transactionAmount = parseFloat(amount);

        if (isNaN(transactionAmount) || transactionAmount <= 0) {
            return res.status(400).json({ error: "Invalid amount" });
        }

        if (type === "subtract") {
            if (transactionAmount > currentBalance) {
                return res.status(400).json({ error: "Insufficient balance" });
            }
            currentBalance = parseFloat((currentBalance - transactionAmount).toFixed(2));
        }

        if (type === "add") {
            currentBalance = parseFloat((currentBalance + transactionAmount).toFixed(2));
        }

        // Update or insert balance
        const response = await sql`
            INSERT INTO user_balances (clerk_id, balance)
            VALUES (${clerkId}, ${currentBalance})
            ON CONFLICT (clerk_id)
            DO UPDATE SET balance = ${currentBalance}
            RETURNING balance;
        `;

        return res.status(200).json({ balance: response[0].balance });
    } catch (error) {
        console.error("Error in POST /api/balance:", error);
        return res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
});

router.get('/', async(req, res) => {
    try {
        const sql = neon(`${process.env.DATABASE_URL}`);
        const { clerkId } = req.query

        if (!clerkId) {
            return res.status(400).json({ error: "Missing Clerk ID" });
        }

        const response = await sql`
            SELECT balance FROM user_balances WHERE clerk_id = ${clerkId} LIMIT 1;
        `;

        return res.status(200).json({ balance: response.length > 0 ? response[0].balance : 0 });
    } catch (error) {
        console.error("Error in GET /api/balance:", error);
        return res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
});

export default router;
