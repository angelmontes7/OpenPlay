import { neon } from '@neondatabase/serverless';

export async function POST(request: Request) {
    try {
        const sql = neon(`${process.env.DATABASE_URL}`);
        const { clerkId, wagerAmount, wagerType } = await request.json();

        if (!clerkId || !wagerAmount || !wagerType) {
            return Response.json({ error: "Missing required fields" }, { status: 400 });
        }

        if (wagerAmount <= 0) {
            return Response.json({ error: "Wager amount must be greater than zero" }, { status: 400 });
        }

        // Insert the wager into the database
        const response = await sql`
            INSERT INTO wagers (clerk_id, amount, type, status)
            VALUES (${clerkId}, ${wagerAmount}, ${wagerType}, 'pending')
            RETURNING id, amount, type, status;
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

        if (!clerkId) {
            return Response.json({ error: "Missing Clerk ID" }, { status: 400 });
        }

        // Retrieve wagers for the given clerkId
        const response = await sql`
            SELECT * FROM wagers WHERE clerk_id = ${clerkId} ORDER BY created_at DESC;
        `;

        return new Response(JSON.stringify(response), { status: 200 });
    } catch (error) {
        console.error("Error in GET /api/wager:", error);
        return Response.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
    }
}
