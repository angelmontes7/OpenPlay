import { neon } from '@neondatabase/serverless';

export async function POST(request: Request) {
    try {
        const { userId, courtId } = await request.json();

        if (!userId || !courtId) {
            return new Response(JSON.stringify({ error: "Missing required fields: userId and courtId" }), { status: 400 });
        }

        const sql = neon(`${process.env.DATABASE_URL}`);

        // Update the check-in record by setting the checkout timestamp.
        const result = await sql`
            UPDATE court_checkins
            SET checkout_timestamp = CURRENT_TIMESTAMP
            WHERE user_id = ${userId} AND court_id = ${courtId} AND checkout_timestamp IS NULL
            RETURNING *;
        `;

        if (result.length === 0) {
            return new Response(JSON.stringify({ error: "No active check-in found for this user at the specified court." }), { status: 400 });
        }

        return new Response(JSON.stringify(result[0]), { status: 200 });
    } catch (error) {
        console.error("Error during check-out:", error);
        return new Response(JSON.stringify({ error: "Failed to check out." }), { status: 500 });
    }
}
