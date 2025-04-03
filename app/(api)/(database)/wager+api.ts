import { neon } from '@neondatabase/serverless';

export async function POST(request: Request) {
    try {
        const sql = neon(`${process.env.DATABASE_URL}`);
        const { clerkId, wagerAmount, court_id } = await request.json();

        if (!clerkId || !wagerAmount || !court_id) {
            return Response.json({ error: "Missing required fields" }, { status: 400 });
        }

        if (wagerAmount <= 0) {
            return Response.json({ error: "Wager amount must be greater than zero" }, { status: 400 });
        }

        // Insert the wager into the database
        const response = await sql`
            INSERT INTO wagers (creator_id, base_bet_amount, sports_facility_id, status, amount_of_participants)
            VALUES (${clerkId}, ${wagerAmount}, ${court_id}, 'pending', 0)
            RETURNING id, base_bet_amount AS wagerAmount, sports_facility_id AS court_id, status, amount_of_participants, created_at;
        `;
        

        return new Response(JSON.stringify(response[0]), { status: 200 });
    } catch (error) {
        console.error("Error in POST /api/wager:", error);
        return Response.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const sql = neon(`${process.env.DATABASE_URL}`);
        const { wagerId, status } = await request.json();

        if (!wagerId || !status) {
            return Response.json({ error: "Missing required fields" }, { status: 400 });
        }

        if (status !== "disputed" && status !== "closed") {
            return Response.json({ error: "Invalid status value" }, { status: 400 });
        }

        // Update wager status
        const response = await sql`
            UPDATE wagers
            SET status = ${status}, updated_at = NOW()
            WHERE id = ${wagerId}
            RETURNING id, status, updated_at;
        `;

        if (response.length === 0) {
            return Response.json({ error: "Wager not found" }, { status: 404 });
        }

        return new Response(JSON.stringify(response[0]), { status: 200 });
    } catch (error) {
        console.error("Error in PATCH /api/wager:", error);
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
                WHERE creator_id = ${clerkId}
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
