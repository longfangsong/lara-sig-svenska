import type { VercelRequest, VercelResponse } from '@vercel/node';
import pg from 'pg';
const { Client } = pg;

async function connect_database(): Promise<pg.Client> {
    const client = new Client({
        port: 5432,
        host: process.env.PGHOST,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: "neondb",
        ssl: true,
    });
    await client.connect();
    return client;
}

export default async function handler(
    request: VercelRequest,
    response: VercelResponse,
) {
    if (request.method == "POST") {
        await create(request, response);
    } else if (request.method == "PATCH") {
        await update(request, response);
    }
}

async function create(request: VercelRequest, response: VercelResponse) {
    const { user_id, spell, id } = request.body;
    let db_client = await connect_database();
    if (spell) {
        let query_result = await db_client.query(`insert into user_word 
            (select $1, id from word where spell = $2)
            returning word_id;`, [user_id, spell]);
        response.status(200).json({ id: query_result.rows[0].word_id });
    } else if (id) {
        await db_client.query(`insert into user_word values ($1, $2) returning word_id;`, [user_id, id]);
        response.status(200).json({ id });
    } else {
        response.status(400).send("");
    }
}

async function update(request: VercelRequest, response: VercelResponse) {
    const { user_id, word_id } = request.query;
    let db_client = await connect_database();
    await db_client.query(`
        UPDATE user_word
        SET review_count = review_count + 1
        WHERE user_id = $1 AND word_id = $2;
    `, [user_id, word_id]);
    response.status(200).json({});
}