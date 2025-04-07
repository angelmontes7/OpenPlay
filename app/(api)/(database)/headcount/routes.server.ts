export const runtime = "nodejs";

import { neon } from '@neondatabase/serverless';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const courtId = searchParams.get("courtId");

    if (!courtId) {
      return new Response(
        JSON.stringify({ error: "Missing courtId parameter." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const sql = neon(process.env.DATABASE_URL as string);
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
    console.error("Error retrieving head count:", error);
    return new Response(
      JSON.stringify({ error: "Failed to retrieve head count." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
