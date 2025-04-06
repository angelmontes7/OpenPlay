import { neon } from '@neondatabase/serverless';

// GET method: Returns the current head count for a given court.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const courtId = searchParams.get("courtId");

    if (!courtId) {
      return new Response(
        JSON.stringify({ error: "Missing courtId parameter" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const sql = neon(`${process.env.DATABASE_URL}`);
    const result = await sql`
      SELECT COUNT(*) AS headCount 
      FROM court_checkins 
      WHERE court_id = ${courtId} AND checkout_timestamp IS NULL;
    `;

    const headCount = Number(result[0].headCount);
    return new Response(
      JSON.stringify({ headCount }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in GET /api/database/check_in:", error);
    return new Response(
      JSON.stringify({ error: "Error fetching head count" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// POST method: Handles checking in a user.
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
