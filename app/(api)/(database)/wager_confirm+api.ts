import { neon } from '@neondatabase/serverless';
export async function PATCH(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { wagerId, userId, winning_vote } = await request.json();
    
    console.log("Received Data:", { wagerId, userId, winning_vote });

    if (!wagerId || !userId || !winning_vote) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Update the participant's record with their vote
    const updateResponse = await sql`
      UPDATE wager_participants
      SET winning_vote = ${winning_vote}
      WHERE wager_id = ${wagerId} AND user_id = ${userId}
      RETURNING *;
    `;

    // Check if every participant has voted for this wager
    const votes = await sql`
      SELECT winning_vote FROM wager_participants
      WHERE wager_id = ${wagerId};
    `;

    const allVoted = votes.every((record: any) => record.winning_vote !== null);
    console.log("All voted:", allVoted);

    if (allVoted) {
      // Create a set of winning votes
      const winningVotesSet = new Set(votes.map((record: any) => record.winning_vote));
      console.log("Winning votes set:", winningVotesSet);

      if (winningVotesSet.size === 1) {
        // All votes are identical; determine the winning team.
        const winningTeam = votes[0].winning_vote;
        
        // Retrieve the wager details
        const [wager] = await sql`
          SELECT * FROM wagers WHERE id = ${wagerId};
        `;
        
        // Find one participant record with the winning team vote.
        const [winningParticipant] = await sql`
          SELECT * FROM wager_participants
          WHERE wager_id = ${wagerId} AND winning_vote = ${winningTeam}
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
        // Not all votes match; mark the wager as disputed.
        await sql`
          UPDATE wagers SET status = 'disputed', updated_at = NOW()
          WHERE id = ${wagerId};
        `;
      }
    }

    return new Response(JSON.stringify(updateResponse[0]), { status: 200 });
  } catch (error) {
    console.error("Error in PATCH /api/wager/confirm:", error);
    return Response.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
