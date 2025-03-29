import { neon } from '@neondatabase/serverless';

export async function POST(request: Request) {
    try {
        const sql = neon(`${process.env.DATABASE_URL}`);
        const { clerkId, wagerAmount, wagerType, court_id } = await request.json();

        if (!clerkId || !wagerAmount || !wagerType || !court_id) {
            return Response.json({ error: "Missing required fields" }, { status: 400 });
        }

        if (wagerAmount <= 0) {
            return Response.json({ error: "Wager amount must be greater than zero" }, { status: 400 });
        }

        // Insert the wager into the database
        const response = await sql`
            INSERT INTO wagers (clerk_id, amount, type, status, court_id)
            VALUES (${clerkId}, ${wagerAmount}, ${wagerType}, 'pending', ${court_id})
            RETURNING id, amount, type, status, court_id, created_at;
        `;

        return new Response(JSON.stringify(response[0]), { status: 200 });
    } catch (error) {
        console.error("Error in POST /api/wager:", error);
        return Response.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const sql = neon(`${process.env.DATABASE_URL}`);
        const { searchParams } = new URL(request.url);
        const clerkId = searchParams.get("clerkId");

        let response;

        if (clerkId) {
            // Retrieve wagers for the given clerkId
            response = await sql`
                SELECT * FROM wagers
                WHERE clerk_id = ${clerkId}
                ORDER BY created_at DESC;
            `;
        } else {
            // Retrieve all wagers
            response = await sql`
                SELECT * FROM wagers
                WHERE status = 'pending'
                ORDER BY created_at DESC;
            `;
        }

        return new Response(JSON.stringify(response), { status: 200 });
    } catch (error) {
        console.error("Error in GET /api/wager:", error);
        return Response.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
    }
}
