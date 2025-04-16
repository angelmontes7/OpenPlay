import { neon } from '@neondatabase/serverless';
import express from 'express';

const router = express.Router();

router.get('/', async(req, res) => {
    try {
        const sql = neon(`${process.env.DATABASE_URL}`);
        const { courtId } = req.query;

        if (!courtId) {
            return res.status(400).json({ error: "Missing Court ID" });
        }

        const response = await sql`
            SELECT COUNT(*) AS count
            FROM court_checkins
            WHERE court_id = ${courtId} AND checkout_timestamp IS NULL;
        `;

        return res.status(200).json({ count: response[0].count });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;