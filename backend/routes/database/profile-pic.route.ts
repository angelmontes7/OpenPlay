import { neon } from '@neondatabase/serverless';
import express from 'express';

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { clerkId, profilePicUrl } = req.body

        if (!clerkId || !profilePicUrl) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const sql = neon(`${process.env.DATABASE_URL}`);
        await sql`
            UPDATE users
            SET profile_pic_url = ${profilePicUrl}
            WHERE clerk_id = ${clerkId}
        `;

        return res.status(200).json({ message: "Profile picture updated successfully" });
    } catch (error) {
        console.error("Error updating profile picture:", error);
        return res.status(500).json({ error: "Failed to update profile picture" });
    }
});

router.get('/', async(req, res) => {
    try {
        const sql = neon(`${process.env.DATABASE_URL}`);
        const { clerkId } = req.query

        if (!clerkId) {
            return res.status(400).json({ error: "Missing Clerk ID" });
        }

        const response = await sql`
            SELECT profile_pic_url FROM users WHERE clerk_id = ${clerkId} LIMIT 1;
        `;

        if (response.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        return res.status(200).json({ profilePicUrl: response[0].profile_pic_url });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error });
    }
});

export default router;