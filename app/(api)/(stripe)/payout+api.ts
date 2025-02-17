import { Stripe } from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clerkId, amount, destination } = body;

    if (!clerkId || !amount || !destination) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
      });
    }

    // Create a payout
    const payout = await stripe.payouts.create({
      amount: parseInt(amount) * 100, // Amount in cents
      currency: "usd",
      destination: destination,
    });

    // Update the user's balance in the database
    const sql = neon(`${process.env.DATABASE_URL}`);
    await sql`
      UPDATE user_balances
      SET balance = balance - ${amount}
      WHERE clerk_id = ${clerkId}
    `;

    return new Response(JSON.stringify({ payout }), { status: 200 });
  } catch (error) {
    console.error("Error in POST /api/payout:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}