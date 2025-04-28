// Access to neon database, express, setting router
import { neon } from '@neondatabase/serverless';
import express from 'express';
const router = express.Router();

// Saves users card info into database
router.post('/', async (req, res) => {
  try {
    const { clerkId, holderName, cardNumber, expiryMonth, expiryYear, cvc } = req.body;

    if (!clerkId || !holderName || !cardNumber || !expiryMonth || !expiryYear || !cvc) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    // Store the card information in the database
    const sql = neon(`${process.env.DATABASE_URL}`);
    await sql`
      INSERT INTO charge_cards (clerk_id, holder_name, card_number, expiry_month, expiry_year, cvc)
      VALUES (${clerkId}, ${holderName}, ${cardNumber}, ${expiryMonth}, ${expiryYear}, ${cvc})
      RETURNING *;
    `;

    return res.status(200).json({ card: { holderName, cardNumber, expiryMonth, expiryYear, cvc } });
  } catch (error) {
    console.error("Error in POST /api/card:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Returns users card info
router.get('/', async(req, res) => {
  try {
    const { clerkId } = req.query

    if (!clerkId) {
      return res.status(400).json({ error: "Missing Clerk ID" });
    }

    const sql = neon(`${process.env.DATABASE_URL}`);
    const result = await sql`
      SELECT holder_name, card_number, expiry_month, expiry_year, cvc
      FROM charge_cards
      WHERE clerk_id = ${clerkId}
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: "Card not found" });
    }

    return res.status(200).json({ cards: result });
  } catch (error) {
    console.error("Error in GET /api/card:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;