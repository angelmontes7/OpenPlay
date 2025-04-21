import { neon } from '@neondatabase/serverless';
import express from 'express';

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const sql = neon(`${process.env.DATABASE_URL}`);
        const { clerkId, type, amount } = req.body;

        if (!clerkId || !type || !amount) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const response = await sql`
            INSERT INTO transactions (clerk_id, type, amount)
            VALUES (${clerkId}, ${type}, ${amount})
            RETURNING *;
        `;

        return res.status(200).json({ transaction: response[0] });
    } catch (error) {
        console.error("Error in POST /api/transactions:", error);
        return res.status(500).json({ error: "Internal Server Error" });
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
            SELECT * FROM transactions WHERE clerk_id = ${clerkId} ORDER BY date DESC;
        `;

        return res.status(200).json({ transactions: response });
    } catch (error) {
        console.error("Error in GET /api/transactions:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;