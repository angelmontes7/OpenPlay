import { neon } from '@neondatabase/serverless';

export async function GET(request: Request) {
    try {
        const sql = neon(`${process.env.DATABASE_URL}`);
        const { searchParams } = new URL(request.url);
        const courtId = searchParams.get("courtId");

        if (!courtId) {
            return Response.json({ error: "Missing Court ID" }, { status: 400 });
        }

        const response = await sql`
            SELECT COUNT(*) AS count
            FROM court_checkins
            WHERE court_id = ${courtId} AND checkout_timestamp IS NULL;
        `;

        return Response.json({ count: response[0].count }, { status: 200 });
    } catch (error) {
        console.error(error);
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
}