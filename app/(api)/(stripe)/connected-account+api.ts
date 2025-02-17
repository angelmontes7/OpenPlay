import { Stripe } from "stripe";
import { neon } from '@neondatabase/serverless';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clerkId, email } = body;

    if (!clerkId || !email) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
      });
    }

    // Create a connected account
    const account = await stripe.accounts.create({
      type: "express",
      email: email,
    });

    // Store the connected account ID in your database
    const sql = neon(`${process.env.DATABASE_URL}`);
    await sql`
      UPDATE users
      SET connected_account_id = ${account.id}
      WHERE clerk_id = ${clerkId}
    `;

    return new Response(JSON.stringify({ account }), { status: 200 });
  } catch (error) {
    console.error("Error in POST /api/create-connected-account:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clerkId = searchParams.get("clerkId");

    if (!clerkId) {
      return new Response(JSON.stringify({ error: "Missing Clerk ID" }), { status: 400 });
    }

    const sql = neon(`${process.env.DATABASE_URL}`);
    const result = await sql`
      SELECT connected_account_id
      FROM users
      WHERE clerk_id = ${clerkId}
    `;

    if (result.length === 0) {
      return new Response(JSON.stringify({ error: "Connected account ID not found" }), { status: 404 });
    }

    return new Response(JSON.stringify({ connected_account_id: result[0].connected_account_id }), { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/connected-account:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}