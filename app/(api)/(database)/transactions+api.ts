import { neon } from '@neondatabase/serverless';

export async function POST(request: Request) {
    try {
        const sql = neon(`${process.env.DATABASE_URL}`);
        const { clerkId, type, amount } = await request.json();

        if (!clerkId || !type || !amount) {
            return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
        }

        const response = await sql`
            INSERT INTO transactions (clerk_id, type, amount)
            VALUES (${clerkId}, ${type}, ${amount})
            RETURNING *;
        `;

        return new Response(JSON.stringify({ transaction: response[0] }), { status: 200 });
    } catch (error) {
        console.error("Error in POST /api/transactions:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const sql = neon(`${process.env.DATABASE_URL}`);
        const { searchParams } = new URL(request.url);
        const clerkId = searchParams.get("clerkId");

        if (!clerkId) {
            return new Response(JSON.stringify({ error: "Missing Clerk ID" }), { status: 400 });
        }

        const response = await sql`
            SELECT * FROM transactions WHERE clerk_id = ${clerkId} ORDER BY date DESC;
        `;

        return new Response(JSON.stringify({ transactions: response }), { status: 200 });
    } catch (error) {
        console.error("Error in GET /api/transactions:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}