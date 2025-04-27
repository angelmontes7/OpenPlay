// Access to neon database, express, setting router
import { neon } from '@neondatabase/serverless';
import express from 'express';
const router = express.Router();

// Updates users checked in log with a checkout timestamp
router.post('/', async (req, res) => {
    try {
        const { userId, courtId } = req.body;

        if (!userId || !courtId) {
            return res.status(400).json({ error: "Missing required fields: userId and courtId" });
        }

        const sql = neon(`${process.env.DATABASE_URL}`);

        // Update the check-in record by setting the checkout timestamp.
        const result = await sql`
            UPDATE court_checkins
            SET checkout_timestamp = CURRENT_TIMESTAMP
            WHERE user_id = ${userId} AND court_id = ${courtId} AND checkout_timestamp IS NULL
            RETURNING *;
        `;

        if (result.length === 0) {
            return res.status(400).json({ error: "No active check-in found for this user at the specified court." });
        }

        return res.status(200).json(result[0]);
    } catch (error) {
        console.error("Error during check-out:", error);
        return res.status(500).json({ error: "Failed to check out." });
    }
});

export default router;