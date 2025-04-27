// Access to neon database, express, setting router
import { neon } from '@neondatabase/serverless';
import express from 'express';
const router = express.Router();

// Checks user into sports facility by inserting users id in correlation to court id
router.post('/', async (req, res) => {
  try {
    const { userId, courtId } = req.body;

    if (!userId || !courtId) {
      return res.status(400).json({ error: "Missing required fields: userId and courtId" });
    }

    const sql = neon(`${process.env.DATABASE_URL}`);

    const existing = await sql`
      SELECT * FROM court_checkins 
      WHERE user_id = ${userId} AND checkout_timestamp IS NULL;
    `;
    if (existing.length > 0) {
      return res.status(400).json({ error: "User is already checked in at another court." });
    }

    const checkin = await sql`
      INSERT INTO court_checkins (user_id, court_id)
      VALUES (${userId}, ${courtId})
      RETURNING *;
    `;

    return res.status(200).json(checkin[0]);
  } catch (error) {
    console.error("Error in POST /api/database/check_in:", error);
    return res.status(500).json({ error: "Failed to check in." });
  }
});

export default router;