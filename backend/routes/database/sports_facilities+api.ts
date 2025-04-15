import { neon } from '@neondatabase/serverless';
import express from 'express';

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { name, address, coordinates, sports, freeVsPaid, capacity, fieldsCourts, pictures } = req.body;
        
        if (!name || !address || !coordinates || !sports || !freeVsPaid || !capacity || !fieldsCourts) {
            return res.status(404).json({ error: "Missing required fields" });
        }

        const sql = neon(`${process.env.DATABASE_URL}`);
        await sql`
            INSERT INTO sports_facilities (name, address, coordinates, sports, free_vs_paid, capacity, fields_courts, pictures)
            VALUES (${name}, ${address}, ${coordinates}, ${sports}, ${freeVsPaid}, ${capacity}, ${fieldsCourts}, ${pictures});
        `;

        return res.status(200).json({ message: "Sports facility added successfully" });
    } catch (error) {
        console.error("Error inserting sports facility:", error);
        return res.status(500).json({ error: "Failed to add sports facility" });
    }
});

router.get('/', async(req, res) => {
    try {
        const sql = neon(`${process.env.DATABASE_URL}`);
        const { facilityId } = req.query

        let response;
        if (facilityId) {
            response = await sql`SELECT * FROM sports_facilities WHERE id = ${facilityId} LIMIT 1;`;
            if (response.length === 0) {
                return res.status(404).json({ error: "Facility not found" });
            }
        } else {
            response = await sql`SELECT * FROM sports_facilities;`;
        }

        return res.status(200).json((response));
    } catch (error) {
        console.error("Error fetching sports facilities:", error);
        return res.status(500).json({ error: "Failed to retrieve sports facilities" });
    }
});

export default router;
