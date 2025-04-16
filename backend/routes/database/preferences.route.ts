import { neon } from '@neondatabase/serverless';
import express from 'express';

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const sql = neon(`${process.env.DATABASE_URL}`);
        const { 
            clerkId, 
            is_private, 
            email_notifications, 
            push_notifications, 
            location_enabled,
            sms_notifications,
            social_notifications,
            game_notifications,
        } = req.body;

        if (!clerkId) {
            return res.status(400).json({ error: "Missing clerkId" });
        }

        const response = await sql`
            INSERT INTO user_preferences (
                user_id, 
                is_private, 
                email_notifications, 
                push_notifications, 
                location_enabled,
                sms_notifications,
                social_notifications,
                game_notifications
            )
            VALUES (
                ${clerkId}, 
                ${is_private}, 
                ${email_notifications}, 
                ${push_notifications}, 
                ${location_enabled},
                ${sms_notifications},
                ${social_notifications},
                ${game_notifications}
            )
            ON CONFLICT (user_id) DO UPDATE
            SET 
                is_private = EXCLUDED.is_private,
                email_notifications = EXCLUDED.email_notifications,
                push_notifications = EXCLUDED.push_notifications,
                location_enabled = EXCLUDED.location_enabled,
                sms_notifications = EXCLUDED.sms_notifications,
                social_notifications = EXCLUDED.social_notifications,
                game_notifications = EXCLUDED.game_notifications
            RETURNING 
                user_id, 
                is_private, 
                email_notifications, 
                push_notifications, 
                location_enabled,
                sms_notifications,
                social_notifications,
                game_notifications;
        `;

        return res.status(200).json(response[0]);
    } catch (error) {
        console.error("Error in POST /api/preferences:", error);
        return res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
});

router.get('/', async(req, res) => {
    try {
        const sql = neon(`${process.env.DATABASE_URL}`);
        const { clerkId } = req.query;

        if (!clerkId) {
            return res.status(400).json({ error: "Missing clerkId" });
        }

        const response = await sql`
            SELECT 
                user_id, 
                is_private, 
                email_notifications, 
                push_notifications, 
                location_enabled,
                sms_notifications,
                social_notifications,
                game_notifications
            FROM user_preferences
            WHERE user_id = ${clerkId};
        `;

        return res.status(200).json(response[0] || {});
    } catch (error) {
        console.error("Error in GET /api/preferences:", error);
        return res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
});

export default router;