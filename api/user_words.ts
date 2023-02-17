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
    } else if (request.method == "GET") {
        await fetch_all(request, response);
    }
}

async function create(request: VercelRequest, response: VercelResponse) {
    const { user_id, spell } = request.body;
    let db_client = await connect_database();
    let query_result = await db_client.query(`insert into user_word (
        select $1, id from word where spell = $2
    ) returning word_id;`, [user_id, spell]);
    response.status(200).json({ id: query_result.rows[0].word_id });
}

async function fetch_all(request: VercelRequest, response: VercelResponse) {
    const { user_id } = request.query;
    let db_client = await connect_database();
    let query_result = await db_client.query(`
        SELECT word.id as id, word.spell as spell, word.meaning as meaning, word.pronunciation as pronunciation
        FROM word, user_word
        WHERE user_word.user_id = $1 AND user_word.word_id = word.id;
    `, [user_id]);
    let result = query_result.rows.map(({ id, spell, meaning, pronunciation }) => ({ id, spell, meaning, pronunciation }));
    response.status(200).json(result);
}
