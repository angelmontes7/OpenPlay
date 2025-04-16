// File: wagerResetVotes+api.ts
import { neon } from '@neondatabase/serverless';
import express from 'express';

const router = express.Router();

router.patch('/', async (req, res) => {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { wagerId } = req.body;
    
    if (!wagerId) {
       return res.status(400).json({ error: "Missing wagerId" });
    }

    // Set winning_vote = NULL for all participants in this wager
    await sql`
      UPDATE wager_participants
      SET winning_vote = NULL
      WHERE wager_id = ${wagerId};
    `;

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error resetting votes:", err);
    return res.status(500).json({ error: err instanceof Error ? err.message : "Unknown" });
  }
});

export default router;