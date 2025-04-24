import express from "express";
import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();
const sql = neon(`${process.env.DATABASE_URL}`);

// Might need this file for getting wagers fee i dont know yet
router.post("/", async (req, res) => {
  try {
    const { source, amount, description, user_clerk_id, currency = "USD" } = req.body;

    if (!source || !amount || isNaN(parseFloat(amount)) || !user_clerk_id) {
      return res.status(400).json({ error: "Missing or invalid required fields" });
    }

    await sql`
      INSERT INTO company_revenue (
        source,
        amount,
        currency,
        description,
        user_clerk_id
      ) VALUES (
        ${source},
        ${amount},
        ${currency},
        ${description},
        ${user_clerk_id}
      )
    `;

    return res.status(200).json({ message: "Revenue logged successfully" });
  } catch (error) {
    console.error("POST /api/company-revenue error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
