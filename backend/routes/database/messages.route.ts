import { neon } from '@neondatabase/serverless';
import express from 'express';

const router = express.Router();

// POST /api/messages - Send a message
router.post('/', async (req, res) => {
    try {
        const sql = neon(`${process.env.DATABASE_URL}`);
        const { sender_id, username, facility_id, text } = req.body;

        if (!sender_id || !username || !facility_id || !text) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const response = await sql`
            INSERT INTO messages (sender_id, username, facility_id, text)
            VALUES (${sender_id}, ${username}, ${facility_id}, ${text})
            RETURNING *;
        `;

        return res.status(200).json({ message: response[0] });
    } catch (error) {
        console.error("Error in POST /api/messages:", error);
        return res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
});

// GET /api/messages?facility_id=abc123 - Get message history for a facility
router.get('/', async (req, res) => {
    try {
        const sql = neon(`${process.env.DATABASE_URL}`);
        const { facility_id } = req.query;

        if (!facility_id) {
            return res.status(400).json({ error: "Missing facility_id" });
        }

        const response = await sql`
            SELECT * FROM messages
            WHERE facility_id = ${facility_id}
            ORDER BY timestamp ASC;
        `;
        return res.status(200).json({ messages: response });
    } catch (error) {
        console.error("Error in GET /api/messages:", error);
        return res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
});

export default router;
