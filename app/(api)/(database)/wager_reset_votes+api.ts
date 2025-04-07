// File: wagerResetVotes+api.ts
import { neon } from '@neondatabase/serverless';

export async function PATCH(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { wagerId } = await request.json();
    if (!wagerId) {
      return Response.json({ error: "Missing wagerId" }, { status: 400 });
    }

    // Set winning_vote = NULL for all participants in this wager
    await sql`
      UPDATE wager_participants
      SET winning_vote = NULL
      WHERE wager_id = ${wagerId};
    `;

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("Error resetting votes:", err);
    return Response.json({ error: err instanceof Error ? err.message : "Unknown" }, { status: 500 });
  }
}
