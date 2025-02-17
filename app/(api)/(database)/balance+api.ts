import { neon } from '@neondatabase/serverless';

export async function POST(request: Request) {
    try {
        const sql = neon(`${process.env.DATABASE_URL}`);
        const { clerkId, amount } = await request.json();

        if (!clerkId || !amount) {
            return Response.json({ error: "Missing required fields" }, { status: 400 });
        }

        const response = await sql`
            INSERT INTO user_balances (clerk_id, balance)
            VALUES (${clerkId}, ${amount})
            ON CONFLICT (clerk_id)
            DO UPDATE SET balance = user_balances.balance + ${amount}
            RETURNING balance;
        `;

        return new Response(JSON.stringify({ balance: response[0].balance }), { status: 200 });
    } catch (error) {
        console.error("Error in POST /api/balance:", error);
        if (error instanceof Error) {
            return Response.json({ error: error.message }, { status: 500 });
        } else {
            return Response.json({ error: "Unknown error" }, { status: 500 });
        }
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

        const response = await sql`
            SELECT balance FROM user_balances WHERE clerk_id = ${clerkId} LIMIT 1;
        `;

        if (response.length === 0) {
            return new Response(JSON.stringify({ balance: 0 }), { status: 200 });
        }

        return new Response(JSON.stringify({ balance: response[0].balance }), { status: 200 });
    } catch (error) {
        console.error("Error in GET /api/balance:", error);
        if (error instanceof Error) {
            return Response.json({ error: error.message }, { status: 500 });
        } else {
            return Response.json({ error: "Unknown error" }, { status: 500 });
        }
    }
}