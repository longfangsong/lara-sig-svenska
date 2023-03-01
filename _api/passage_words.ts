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
    let passage_id = request.query.passage_id;
    let sql = `select word.id as word_id
        from (
            select regexp_split_to_table(content, '\\s') as origin 
            from Article 
            where id=$1
        ) as t LEFT JOIN word ON word.spell=rtrim(t.origin, '.,?!');`;
    let db_client = await connect_database();
    let query_result = await db_client.query(sql, [passage_id]);
    let result = query_result.rows.map(({ word_id }) => word_id);
    response.status(200).json(result);
}