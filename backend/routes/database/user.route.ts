import { neon } from '@neondatabase/serverless';
import express from 'express';

const router = express.Router();

const formatDateToISO = (dob: string) => {
    if (!dob) return null;
    const [month, day, year] = dob.split("-");
    return `${year}-${month}-${day}`; // Converts "MM-DD-YYYY" → "YYYY-MM-DD"
};

router.post('/', async (req, res) => {
    try{
        const sql = neon(`${process.env.DATABASE_URL}`);
        const { username, email, dob, clerkId } = req.body;

        if(!username || !email || !clerkId) {
            return res.status(400).json({error: "Missing required fields"})
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

        return res.status(200).json({data: response });
    } catch (error) {
        console.log(error);
        return res.status(500).json({error: error})

    }
});

router.patch('/', async (req, res) => {
    try {
        const sql = neon(`${process.env.DATABASE_URL}`);
        const { clerkId, dob } = req.body

        if (!clerkId) {
            return Response.json({ error: "Missing Clerk ID" }, { status: 400 });
        }

        if (!dob) {
            return Response.json({ error: "Missing Date of Birth" }, { status: 400 });
        }

        const formattedDob = formatDateToISO(dob);

        const response = await sql`
            UPDATE users 
            SET dob = ${formattedDob}
            WHERE clerk_id = ${clerkId};
        `;

        return res.status(200).json({ message: "DOB updated successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error });
    }
});

router.get('/', async(req, res) => {
    try {
        const sql = neon(`${process.env.DATABASE_URL}`);
        const { clerkId } = req.query

        if (clerkId) {
            // Fetch specific user by clerkId
            const response = await sql`
                SELECT * FROM users WHERE clerk_id = ${clerkId} LIMIT 1;
            `;

            if (response.length === 0) {
                return res.status(404).json({ error: "User not found" });
            }

            return res.status(200).json(response);
        } else {
            // Fetch all users
            const response = await sql`
                SELECT id, username, email, dob, clerk_id FROM users;
            `;

            return res.status(200).json(response);
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error || "Internal Server Error" });
    }
});

export default router;