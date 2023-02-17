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

export default async function handler(request: VercelRequest, response: VercelResponse) {
    const { user_id, passage_id } = request.query;
    let sql = `select word.id as word_id, t_added.review_count as review_count
        from (
            select regexp_split_to_table(content, '\\s') as origin 
            from Article 
            where id=$1
        ) as t_words
        LEFT JOIN word ON word.spell=rtrim(t_words.origin, '.,?!')
        LEFT JOIN (
            select review_count, word_id from user_word where user_id=$2
        ) as t_added ON t_added.word_id=word.id;`
    let db_client = await connect_database();
    let query_result = await db_client.query(sql, [passage_id, user_id]);
    let result = query_result.rows.map(({ word_id, review_count }) => ({ word_id, review_count }));
    response.status(200).json(result);
}