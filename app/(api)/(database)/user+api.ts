import { neon } from '@neondatabase/serverless';

const formatDateToISO = (dob: string) => {
    if (!dob) return null;
    const [month, day, year] = dob.split("-");
    return `${year}-${month}-${day}`; // Converts "MM-DD-YYYY" → "YYYY-MM-DD"
};

export async function POST(request: Request) {
    try{
        const sql = neon(`${process.env.DATABASE_URL}`);
        const { username, email, dob, clerkId } = await request.json();

        if(!username || !email || !clerkId) {
            return Response.json({error: "Missing required fields"}, {status: 400})
        }
        
        const formattedDob = dob ? formatDateToISO(dob) : null; // Convert if provided, else null

        const response = await sql `
            INSERT INTO users (
                username,
                email,
                dob,
                clerk_id
            )
            VALUES (
                ${username},
                ${email},
                ${formattedDob},
                ${clerkId}
            )    
        `;

        return new Response(JSON.stringify({data: response }), {
            status: 201,
        });
    } catch (error) {
        console.log(error);
        return Response.json({error: error}, {status: 500})

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
            SELECT dob FROM users WHERE clerk_id = ${clerkId} LIMIT 1;
        `;

        if (response.length === 0) {
            return Response.json({ error: "User not found" }, { status: 404 });
        }

        return Response.json({ dob: response[0].dob }, { status: 200 });
    } catch (error) {
        console.log(error);
        return Response.json({ error: error }, { status: 500 });
    }
}