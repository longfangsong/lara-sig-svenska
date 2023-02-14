import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from "axios";
import pg from 'pg';
const { Client } = pg;
import { load } from "cheerio";
import qs from 'querystring';

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

async function fetch_meaning(word: string): Promise<string> {
    const url = `https://www.dict.com/swedish-english/${encodeURIComponent(word)}`;
    const response = await axios.get(url);
    const $ = load(response.data);
    const meaning = $(".entry").html();
    return meaning || "";
}

async function fetch_pronunciation(word: string): Promise<Buffer> {
    const url = `https://ttsmp3.com/makemp3_new.php`;
    const content = qs.encode({
        msg: word,
        lang: "Astrid",
        source: "ttsmp3"
    });
    let response = await axios.post(url, content);
    let pronunciation_url = response.data['URL'];
    let pronunciation_response = await axios.get(pronunciation_url, {
        responseType: 'blob'
    });
    return Buffer.from(pronunciation_response.data);
}

export default async function handler(
    request: VercelRequest,
    response: VercelResponse,
) {
    let word = request.query.word as string;
    let db_client = await connect_database();
    await db_client.query("BEGIN");
    let result = await db_client.query("SELECT id FROM word WHERE spell = $1", [word]);
    if (result.rowCount == 0) {
        let [meaning, pronunciation] = await Promise.all([fetch_meaning(word), fetch_pronunciation(word)]);
        try {
            await db_client.query("INSERT INTO word (spell, meaning, pronunciation) VALUES ($1, $2, $3)", [word, meaning, pronunciation]);
        } catch {
            // ignore
        }
    }
    let query_result = await db_client.query("SELECT id, spell, meaning, pronunciation FROM word WHERE spell = $1", [word]);
    await db_client.query("COMMIT");
    let word_id = query_result.rows[0].id;
    let word_spell = query_result.rows[0].spell;
    let word_meaning = query_result.rows[0].meaning;
    let word_pronunciation = query_result.rows[0].pronunciation;
    response.setHeader('Cache-Control', 'max-age=2630000,s-maxage=2630000');
    response.status(200).json({
        id: word_id,
        spell: word_spell,
        meaning: word_meaning,
        pronunciation: word_pronunciation,
    });
}