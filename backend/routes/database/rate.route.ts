import { neon } from '@neondatabase/serverless';
import express from 'express';

const router = express.Router();

router.post('/', async (req,res) => {
try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { userId, courtId, rating } = req.body;


    if (!userId || !courtId || typeof rating !== 'number') {
        return res.status(400).json({ error: "Missing or invalid fields: userId, courtId, or rating" });
    }

    const result = await sql`
        INSERT INTO court_ratings (user_id, court_id, rating)
        VALUES (${userId}, ${courtId}, ${rating})
        RETURNING *;
    `;

   return res.status(200).json(result[0]);

   } catch (error) {
    console.error("Error recording rating:", error);
    return res.status(500).json({ error: "Failed to record rating" });
   }
});

export default router;
