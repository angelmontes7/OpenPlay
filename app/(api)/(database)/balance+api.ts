import { neon } from '@neondatabase/serverless';

export async function POST(request: Request) {
    try {
        const sql = neon(`${process.env.DATABASE_URL}`);
        const { clerkId, type, amount } = await request.json();

        if (!clerkId || !type || !amount) {
            return Response.json({ error: "Missing required fields" }, { status: 400 });
        }

        if (type !== "add" && type !== "subtract") {
            return Response.json({ error: "Invalid transaction type" }, { status: 400 });
        }

        if (amount <= 0) {
            return Response.json({ error: "Amount must be greater than zero" }, { status: 400 });
        }

        // Retrieve current balance
        const balanceResult = await sql`
            SELECT balance FROM user_balances WHERE clerk_id = ${clerkId} LIMIT 1;
        `;

        let currentBalance = balanceResult.length > 0 ? balanceResult[0].balance : 0;

        // Ensure currentBalance and amount are numbers
        currentBalance = parseFloat(currentBalance) || 0;
        const transactionAmount = parseFloat(amount);

        if (isNaN(transactionAmount) || transactionAmount <= 0) {
            return Response.json({ error: "Invalid amount" }, { status: 400 });
        }

        if (type === "subtract") {
            if (transactionAmount > currentBalance) {
                return Response.json({ error: "Insufficient balance" }, { status: 400 });
            }
            currentBalance = parseFloat((currentBalance - transactionAmount).toFixed(2));
        }

        if (type === "add") {
            currentBalance = parseFloat((currentBalance + transactionAmount).toFixed(2));
        }

        // Update or insert balance
        const response = await sql`
            INSERT INTO user_balances (clerk_id, balance)
            VALUES (${clerkId}, ${currentBalance})
            ON CONFLICT (clerk_id)
            DO UPDATE SET balance = ${currentBalance}
            RETURNING balance;
        `;

        return new Response(JSON.stringify({ balance: response[0].balance }), { status: 200 });
    } catch (error) {
        console.error("Error in POST /api/balance:", error);
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

        const response = await sql`
            SELECT balance FROM user_balances WHERE clerk_id = ${clerkId} LIMIT 1;
        `;

        return new Response(JSON.stringify({ balance: response.length > 0 ? response[0].balance : 0 }), { status: 200 });
    } catch (error) {
        console.error("Error in GET /api/balance:", error);
        return Response.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
    }
}
