import { neon } from '@neondatabase/serverless';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clerkId, cardNumber, expiryMonth, expiryYear, cvc } = body;

    if (!clerkId || !cardNumber || !expiryMonth || !expiryYear || !cvc) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
      });
    }

    // Store the card information in the database
    const sql = neon(`${process.env.DATABASE_URL}`);
    await sql`
      INSERT INTO charge_cards (clerk_id, card_number, expiry_month, expiry_year, cvc)
      VALUES (${clerkId}, ${cardNumber}, ${expiryMonth}, ${expiryYear}, ${cvc})
      ON CONFLICT (clerk_id)
      DO UPDATE SET card_number = ${cardNumber}, expiry_month = ${expiryMonth}, expiry_year = ${expiryYear}, cvc = ${cvc};
    `;

    return new Response(JSON.stringify({ card: { cardNumber, expiryMonth, expiryYear, cvc } }), { status: 200 });
  } catch (error) {
    console.error("Error in POST /api/card:", error);
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
      SELECT card_number, expiry_month, expiry_year, cvc
      FROM charge_cards
      WHERE clerk_id = ${clerkId}
    `;

    if (result.length === 0) {
      return new Response(JSON.stringify({ error: "Card not found" }), { status: 404 });
    }

    return new Response(JSON.stringify({ card: result[0] }), { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/card:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}