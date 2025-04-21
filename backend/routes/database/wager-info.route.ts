import { neon } from '@neondatabase/serverless';
import express from 'express';

const router = express.Router();

router.get('/', async(req, res) => {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);

    const { wagerId } = req.query;

    if (!wagerId) {
      return res.status(400).json({ error: "wagerId is required" });
    }

    // Retrieve wager details based on wagerId
    const response = await sql`
      SELECT 
        wp.id AS participant_id,
        wp.wager_id,
        wp.user_id,
        wp.team_name,
        wp.bet_amount,
        wp.joined_at,
        wp.winning_vote,
        w.creator_id,
        w.sports_facility_id,
        w.base_bet_amount,
        w.total_amount,
        w.status AS wager_status,
        w.created_at,
        w.updated_at,
        w.amount_of_participants
      FROM wager_participants wp
      JOIN wagers w ON wp.wager_id = w.id
      WHERE wp.wager_id = ${wagerId}
      ORDER BY wp.joined_at DESC;
    `;

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in GET /api/wager_participants:", error);
    return res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" }
    );
  }
});

export default router;