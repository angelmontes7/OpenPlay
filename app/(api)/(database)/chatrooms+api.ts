// import { neon } from '@neondatabase/serverless';
// import { NextApiRequest, NextApiResponse } from 'next';

// // Function to fetch all chatrooms
// async function getChatRooms() {
//   try {
//     const sql = neon(`${process.env.DATABASE_URL}`);
//     const result = await sql`SELECT * FROM chatrooms`;
//     return result;  // Return the chatrooms
//   } catch (err) {
//     console.error(err);
//     throw new Error('Failed to fetch chatrooms');
//   }
// }

// // Function to create a new chatroom
// async function createChatRoom(name: string) {
//   if (!name) {
//     throw new Error('Chatroom name is required');
//   }

//   try {
//     const sql = neon(`${process.env.DATABASE_URL}`);
//     const result = await sql`
//       INSERT INTO chatrooms (name)
//       VALUES (${name})
//       RETURNING *`;
//     return result[0]; // Return the first row from the inserted chatroom
//   } catch (err) {
//     console.error(err);
//     throw new Error('Failed to create chatroom');
//   }
// }

// export default async function handler(request: NextApiRequest, res: NextApiResponse) {
//   try {
//     if (request.method === 'GET') {
//       const chatrooms = await getChatRooms();
//       return res.status(200).json({ chatrooms }); // Send the chatrooms as a JSON response

//     } else if (request.method === 'POST') {
//       const { name } = request.body;  // Correctly call request.json()
//       const newChatRoom = await createChatRoom(name);
//       return res.status(201).json({ newChatRoom }); // Send the new chatroom as a JSON response

//     } else {
//       return res.status(405).json({ error: 'Method not allowed' }); // Handle unsupported methods
//     }
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ error: 'Something went wrong' }); // Generic error response
//   }
// }
import { neon } from '@neondatabase/serverless';

export async function POST(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { name, userIds } = await request.json(); // userIds: number[]

    if (!name || !userIds || !Array.isArray(userIds)) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Insert the chatroom
    const chatroomInsert = await sql`
      INSERT INTO chatrooms (name)
      VALUES (${name})
      RETURNING id
    `;

    const chatroomId = chatroomInsert[0].id;

    // 2. Insert users into the chat_room_users table
    const insertUserLinks = userIds.map(userId => {
      return sql`
        INSERT INTO chat_room_users (chatroom_id, user_id)
        VALUES (${chatroomId}, ${userId})
      `;
    });

    await Promise.all(insertUserLinks);

    return Response.json({ chatroomId }, { status: 201 });
  } catch (error) {
    console.error(error);
    return Response.json({ error }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return Response.json({ error: "Missing userId" }, { status: 400 });
    }

    const response = await sql`
      SELECT
        c.id,
        c.name
      FROM
        chatrooms c
      JOIN
        chat_room_users cru ON c.id = cru.chatroom_id
      WHERE
        cru.user_id = ${userId}
    `;

    return Response.json({ chatrooms: response }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error }, { status: 500 });
  }
}