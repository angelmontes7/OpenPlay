import { neon } from '@neondatabase/serverless';

export async function POST(request: Request) {
  try {
    const { userId, courtId } = await request.json();

    if (!userId || !courtId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: userId and courtId" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const sql = neon(`${process.env.DATABASE_URL}`);

    const existing = await sql`
      SELECT * FROM court_checkins 
      WHERE user_id = ${userId} AND checkout_timestamp IS NULL;
    `;
    if (existing.length > 0) {
      return new Response(
        JSON.stringify({ error: "User is already checked in at another court." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const checkin = await sql`
      INSERT INTO court_checkins (user_id, court_id)
      VALUES (${userId}, ${courtId})
      RETURNING *;
    `;

    return new Response(
      JSON.stringify(checkin[0]),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in POST /api/database/check_in:", error);
    return new Response(
      JSON.stringify({ error: "Failed to check in." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
