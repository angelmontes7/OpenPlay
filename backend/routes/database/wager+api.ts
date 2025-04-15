import { neon } from '@neondatabase/serverless';
import express from 'express';

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const sql = neon(`${process.env.DATABASE_URL}`);
        const { clerkId, wagerAmount, court_id } = await req.body

        if (!clerkId || !wagerAmount || !court_id) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        if (wagerAmount <= 0) {
            return res.status(400).json({ error: "Wager amount must be greater than zero" });
        }

        // Insert the wager into the database
        const response = await sql`
            INSERT INTO wagers (creator_id, base_bet_amount, sports_facility_id, status, amount_of_participants)
            VALUES (${clerkId}, ${wagerAmount}, ${court_id}, 'pending', 0)
            RETURNING id, base_bet_amount AS wagerAmount, sports_facility_id AS court_id, status, amount_of_participants, created_at;
        `;
        

        return res.status(200).json(response[0]);
    } catch (error) {
        console.error("Error in POST /api/wager:", error);
        return res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
});

router.patch('/', async (req, res) => {
    try {
        const sql = neon(`${process.env.DATABASE_URL}`);
        const { wagerId, status } = await req.body;

        if (!wagerId || !status) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        if (status !== "disputed" && status !== "closed") {
            return res.status(400).json({ error: "Invalid status value" });
        }

        // Update wager status
        const response = await sql`
            UPDATE wagers
            SET status = ${status}, updated_at = NOW()
            WHERE id = ${wagerId}
            RETURNING id, status, updated_at;
        `;

        if (response.length === 0) {
            return res.status(404).json({ error: "Wager not found" });
        }

        res.status(200).json(response);
    } catch (error) {
        console.error("Error in PATCH /api/wager:", error);
        return res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
});


router.get('/', async(req, res) => {
    try {
        const sql = neon(`${process.env.DATABASE_URL}`);

        const { clerkId } = req.query;

        let response;

        if (clerkId) {
            // Retrieve wagers for the given clerkId
            response = await sql`
                SELECT * FROM wagers
                WHERE creator_id = ${clerkId}
                ORDER BY created_at DESC;
            `;
        } else {
            // Retrieve all wagers
            response = await sql`
                SELECT * FROM wagers
                WHERE status = 'pending'
                ORDER BY created_at DESC;
            `;
        }

        res.status(200).json(response);
    } catch (error) {
        console.error("Error in GET /api/wager:", error);
        res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
});

export default router;