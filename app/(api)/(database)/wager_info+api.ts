import { neon } from '@neondatabase/serverless';

export async function GET(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { searchParams } = new URL(request.url);
    const wagerId = searchParams.get("wagerId");

    if (!wagerId) {
      return new Response(JSON.stringify({ error: "wagerId is required" }), { status: 400 });
    }

    // Retrieve wager details based on wagerId
    const response = await sql`
      SELECT 
        wp.id AS participant_id,
        wp.wager_id,
        wp.user_id,
        wp.team_name,
        wp.bet_amount,
        wp.joined_at,
        wp.winning_vote,
        w.creator_id,
        w.sports_facility_id,
        w.base_bet_amount,
        w.total_amount,
        w.status AS wager_status,
        w.created_at,
        w.updated_at,
        w.amount_of_participants
      FROM wager_participants wp
      JOIN wagers w ON wp.wager_id = w.id
      WHERE wp.wager_id = ${wagerId}
      ORDER BY wp.joined_at DESC;
    `;

    return new Response(JSON.stringify(response), { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/wager_participants:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
