import { neon } from '@neondatabase/serverless';

export async function POST(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { wagerId, clerkId, teamName, betAmount } = await request.json();

    // Validate required fields.
    if (!wagerId || !clerkId || !teamName || !betAmount) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }
    
    if (betAmount <= 0) {
      return Response.json({ error: "Bet amount must be greater than zero" }, { status: 400 });
    }

    // Retrieve the wager to ensure it exists and check the base_bet_amount.
    const wagerResult = await sql`
      SELECT base_bet_amount, total_amount
      FROM wagers
      WHERE id = ${wagerId}
      FOR UPDATE
    `;
    
    if (wagerResult.length === 0) {
      return Response.json({ error: "Wager not found" }, { status: 404 });
    }

    // Enforce that the joining bet equals the wager's base bet amount.
    if (Number(betAmount) !== Number(wagerResult[0].base_bet_amount)) {
      return Response.json(
        { error: "Bet amount must equal the wager's base bet amount" },
        { status: 400 }
      );
    }

    // Insert the new participant into the wager_participants table.
    const participantResult = await sql`
      INSERT INTO wager_participants (wager_id, user_id, team_name, bet_amount)
      VALUES (${wagerId}, ${clerkId}, ${teamName}, ${betAmount})
      RETURNING id, wager_id, user_id, team_name, bet_amount, joined_at;
    `;
    
    // Update the wagers table's total_amount by adding the new bet.
    const updatedWagerResult = await sql`
      UPDATE wagers
      SET total_amount = total_amount + ${betAmount},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${wagerId}
      RETURNING id, total_amount;
    `;
    
    return new Response(JSON.stringify({
      participant: participantResult[0],
      updatedWager: updatedWagerResult[0]
    }), { status: 200 });
  } catch (error) {
    console.error("Error in POST /api/wager_participants:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { searchParams } = new URL(request.url);
    const wagerId = searchParams.get("wagerId");

    let response;

    if (wagerId) {
      // Retrieve participants for a specific wager.
      response = await sql`
        SELECT * FROM wager_participants
        WHERE wager_id = ${wagerId}
        ORDER BY joined_at DESC;
      `;
    } else {
      // Retrieve all wager participants.
      response = await sql`
        SELECT * FROM wager_participants
        ORDER BY joined_at DESC;
      `;
    }

    return new Response(JSON.stringify(response), { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/wager_participants:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
