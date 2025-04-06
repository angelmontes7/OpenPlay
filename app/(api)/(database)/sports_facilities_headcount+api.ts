import { neon } from '@neondatabase/serverless';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const courtId = searchParams.get("courtId");

        if (!courtId) {
            return new Response(JSON.stringify({ error: "Missing courtId parameter." }), { status: 400 });
        }

        const sql = neon(`${process.env.DATABASE_URL}`);

        const result = await sql`
            SELECT COUNT(*) AS headCount 
            FROM court_checkins 
            WHERE court_id = ${courtId} AND checkout_timestamp IS NULL;
        `;
        
        // Convert the count (returned as a string) to a number.
        const headCount = Number(result[0].headCount);

        return new Response(JSON.stringify({ headCount }), { status: 200 });
    } catch (error) {
        console.error("Error retrieving head count:", error);
        return new Response(JSON.stringify({ error: "Failed to retrieve head count." }), { status: 500 });
    }
}
