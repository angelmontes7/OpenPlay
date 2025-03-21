import { neon } from '@neondatabase/serverless';

export async function POST(request: Request) {
    try {
        const { name, address, coordinates, sports, freeVsPaid, capacity, fieldsCourts, pictures } = await request.json();
        
        if (!name || !address || !coordinates || !sports || !freeVsPaid || !capacity || !fieldsCourts) {
            return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
        }

        const sql = neon(`${process.env.DATABASE_URL}`);
        await sql`
            INSERT INTO sports_facilities (name, address, coordinates, sports, free_vs_paid, capacity, fields_courts, pictures)
            VALUES (${name}, ${address}, ${coordinates}, ${sports}, ${freeVsPaid}, ${capacity}, ${fieldsCourts}, ${pictures});
        `;

        return new Response(JSON.stringify({ message: "Sports facility added successfully" }), { status: 201 });
    } catch (error) {
        console.error("Error inserting sports facility:", error);
        return new Response(JSON.stringify({ error: "Failed to add sports facility" }), { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const sql = neon(`${process.env.DATABASE_URL}`);
        const { searchParams } = new URL(request.url);
        const facilityId = searchParams.get("id");

        let response;
        if (facilityId) {
            response = await sql`SELECT * FROM sports_facilities WHERE id = ${facilityId} LIMIT 1;`;
            if (response.length === 0) {
                return new Response(JSON.stringify({ error: "Facility not found" }), { status: 404 });
            }
        } else {
            response = await sql`SELECT * FROM sports_facilities;`;
        }

        return new Response(JSON.stringify(response), { status: 200 });
    } catch (error) {
        console.error("Error fetching sports facilities:", error);
        return new Response(JSON.stringify({ error: "Failed to retrieve sports facilities" }), { status: 500 });
    }
}
