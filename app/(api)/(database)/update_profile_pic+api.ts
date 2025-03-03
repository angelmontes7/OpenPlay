import { neon } from '@neondatabase/serverless';

export async function POST(request: Request) {
    try {
        const { clerkId, profilePicUrl } = await request.json();
        console.log("Received request data:", { clerkId, profilePicUrl });

        if (!clerkId || !profilePicUrl) {
            return new Response(JSON.stringify({ error: "Missing required fields" }), {
                status: 400,
            });
        }

        const sql = neon(`${process.env.DATABASE_URL}`);
        await sql`
            UPDATE users
            SET profile_pic_url = ${profilePicUrl}
            WHERE clerk_id = ${clerkId}
        `;

        return new Response(JSON.stringify({ message: "Profile picture updated successfully" }), { status: 200 });
    } catch (error) {
        console.error("Error updating profile picture:", error);
        return new Response(JSON.stringify({ error: "Failed to update profile picture" }), { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const sql = neon(`${process.env.DATABASE_URL}`);
        const { searchParams } = new URL(request.url);
        const clerkId = searchParams.get("clerkId");

        if (!clerkId) {
            return Response.json({ error: "Missing Clerk ID" }, { status: 400 });
        }

        const response = await sql`
            SELECT profile_pic_url FROM users WHERE clerk_id = ${clerkId} LIMIT 1;
        `;

        if (response.length === 0) {
            return Response.json({ error: "User not found" }, { status: 404 });
        }

        return Response.json({ profilePicUrl: response[0].profile_pic_url }, { status: 200 });
    } catch (error) {
        console.log(error);
        return Response.json({ error: error }, { status: 500 });
    }
}