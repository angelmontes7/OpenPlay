import { neon } from '@neondatabase/serverless';

export async function POST(request: Request) {
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
        } = await request.json();

        if (!clerkId) {
            return Response.json({ error: "Missing clerkId" }, { status: 400 });
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

        return new Response(JSON.stringify(response[0]), { status: 200 });
    } catch (error) {
        console.error("Error in POST /api/preferences:", error);
        return Response.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const sql = neon(`${process.env.DATABASE_URL}`);
        const { searchParams } = new URL(request.url);
        const clerkId = searchParams.get("clerkId");

        if (!clerkId) {
            return Response.json({ error: "Missing clerkId" }, { status: 400 });
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

        return new Response(JSON.stringify(response[0] || {}), { status: 200 });
    } catch (error) {
        console.error("Error in GET /api/preferences:", error);
        return Response.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
    }
}
