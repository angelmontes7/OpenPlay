import { neon } from '@neondatabase/serverless';
export async function PATCH(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { wagerId, userId, winning_vote } = await request.json();
    
    console.log("Received Data:", { wagerId, userId, winning_vote });

    if (!wagerId || !userId || !winning_vote) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Record this users vote
    await sql`
      UPDATE wager_participants
      SET winning_vote = ${winning_vote}
      WHERE wager_id = ${wagerId} AND user_id = ${userId}
    `;

    // Fetch all votes
    const votes = await sql`
      SELECT user_id, bet_amount, winning_vote 
      FROM wager_participants
      WHERE wager_id = ${wagerId};
    `;

    // Fetch wager status
    const [{ status: currentStatus }] = await sql`
      SELECT status FROM wagers WHERE id = ${wagerId};
    `;

    // Fetch if all have voted
    const allVoted = votes.every((record: any) => record.winning_vote !== null);
    console.log("All voted:", allVoted);

    // Check if all have voted
    if (allVoted) {

      // Determine if votes are unanimous
      const winningVotesSet = new Set(votes.map((record: any) => record.winning_vote));

      if (winningVotesSet.size === 1) {
        // Case A: Unanimous decision

        // All votes are identical; determine the winning team.
        const winningTeam = votes[0].winning_vote;
        
        // Retrieve the wager details
        const [wager] = await sql`
          SELECT * FROM wagers WHERE id = ${wagerId};
        `;
        
        // Find one participant record with the winning team vote.
        const [winningParticipant] = await sql`
          SELECT * FROM wager_participants
          WHERE wager_id = ${wagerId} AND team_name = ${winningTeam}
          LIMIT 1;
        `;
        
        if (wager && winningParticipant) {
          // Calculate payout – 95% of total_amount
          const payout = parseFloat(wager.total_amount) * 0.95;
          
          // Update the wager to closed
          await sql`
            UPDATE wagers SET status = 'closed', updated_at = NOW()
            WHERE id = ${wagerId};
          `;
          
          // Update the winner's balance
          await sql`
            UPDATE user_balances
            SET balance = balance + ${payout}
            WHERE clerk_id = ${winningParticipant.user_id};
          `;
          
          // Log the transaction
          await sql`
            INSERT INTO transactions (clerk_id, type, amount)
            VALUES (${winningParticipant.user_id}, 'wager_win', ${payout})
            RETURNING *;
          `;
        }
      } else {
        // Case B or C: disagreement
        if (currentStatus !== "disputed") {
          // Case B: first time disagreement -> mark disputed
          await sql`
            UPDATE wagers SET status = 'disputed', updated_at = NOW()
            WHERE id = ${wagerId};
          `;
          // Set votes to null to re-allow users to vote again
          await sql`
            UPDATE wager_participants
            SET winning_vote = null
            WHERE wager_id = ${wagerId};
          `;
        } else {
          // Case C: already disputed & still in disagreement -> refund 90% to everyone and close wager

          // Refund each participant individually
          for (const r of votes) {
            const refund = parseFloat(r.bet_amount) * 0.90;
            await sql`
              UPDATE user_balances
              SET balance = balance + ${refund}
              WHERE clerk_id = ${r.user_id};
            `;
            await sql`
              INSERT INTO transactions (clerk_id, type, amount)
              VALUES (${r.user_id}, 'wager_refund', ${refund});
            `;
          }
          // Close wager
          await sql`
            UPDATE wagers SET status = 'closed', updated_at = NOW()
            WHERE id = ${wagerId};
          `;
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Error in PATCH /api/wager/confirm:", error);
    return Response.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
