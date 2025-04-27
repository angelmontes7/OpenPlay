// Access to neon database, express, setting router
const { neon } = require("@neondatabase/serverless");
import express from 'express';
const router = express.Router();

// Returns the avg stars based on court id
router.get('/', async(req, res) => {
    const sql = neon(`${process.env.DATABASE_URL}`);
    try {
        const { courtId } = req.query


        if (!courtId) {
            return res.status(400).json({ error: "Missing courtId parameter." });
        }

        const result = await sql`
            SELECT COALESCE(ROUND(AVG(user_avg)::numeric, 2), 0.00) AS stars
            FROM (
            SELECT AVG(rating) AS user_avg
            FROM court_ratings
            WHERE court_id = ${courtId}
            GROUP BY user_id
            ) AS per_user;
        `;
        const stars = Number(result[0].stars);


        return res.status(200).json({ stars });
    } catch (error) {
        console.error("Error fetching average rating:", error);
        return res.status(500).json({ error: "Failed to retrieve average rating." },
        );
    }
});

export default router;