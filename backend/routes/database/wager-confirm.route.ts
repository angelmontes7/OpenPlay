import { neon } from '@neondatabase/serverless';
import express from 'express';

const router = express.Router();

router.patch('/', async (req, res) => {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { wagerId, userId, winning_vote } = req.body

    if (!wagerId || !userId || !winning_vote) {
      return res.status(400).json({ error: "Missing required fields" });
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

    // Case for handling only one participant
    if (votes.length === 1) {
      const [singleParticipant] = votes;
      const refundAmount = parseFloat(singleParticipant.bet_amount);
      
      // Refund the full amount to the only participant
      await sql`
        UPDATE user_balances
        SET balance = balance + ${refundAmount}
        WHERE clerk_id = ${singleParticipant.user_id};
      `;
      
      // Log the transaction
      await sql`
        INSERT INTO transactions (clerk_id, type, amount)
        VALUES (${singleParticipant.user_id}, 'wager_refund', ${refundAmount});
      `;
      
      // Update the wager status to closed
      await sql`
        UPDATE wagers SET status = 'closed', updated_at = NOW()
        WHERE id = ${wagerId};
      `;
      
      return res.status(200).json({ success: true, message: "Full refund issued to the single participant." });
    }
    
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
          // Calculate payout and company fee – 99% of total_amount
          const totalAmount = parseFloat(wager.total_amount) * 100;
          const payout = totalAmount * 0.99; // 99% to user
          const companyFee = totalAmount - payout; // 1% to company
          
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
          
          const description = `1% fee from closed wager of $${(totalAmount / 100)}`;

          // 7. Log company fee
          await sql`
            INSERT INTO company_revenue (
              source,
              amount,
              currency,
              description,
              user_clerk_id,
              created_at
            ) VALUES (
              'withdrawal fee',
              ${companyFee / 100},
              'USD',
              ${description},
              ${userId},
              NOW()
            )
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
          let totalAmount = 0;
          // Refund each participant individually
          for (const r of votes) {
            const refund = parseFloat(r.bet_amount) * 0.90;
            totalAmount += parseFloat(r.bet_amount) * 0.10
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
          const description = `10% fee from disputed wager of $${(totalAmount / 100)}`;

          // 7. Log company fee
          await sql`
            INSERT INTO company_revenue (
              source,
              amount,
              currency,
              description,
              user_clerk_id,
              created_at
            ) VALUES (
              'withdrawal fee',
              ${totalAmount / 100},
              'USD',
              ${description},
              ${userId},
              NOW()
            )
          `;
          // Close wager
          await sql`
            UPDATE wagers SET status = 'closed', updated_at = NOW()
            WHERE id = ${wagerId};
          `;
        }
      }
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error in PATCH /api/wager/confirm:", error);
    return res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
  }
});

export default router;