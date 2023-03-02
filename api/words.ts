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

async function fetch_meaning(word: string): Promise<[string, string, string] | null> {
    const url = `https://www.dict.com/swedish-english/${encodeURIComponent(word)}`;
    const response = await axios.get(url);
    const $ = load(response.data);
    const origin_spell = $(".entry .lex_ful_entr").text();
    const pronunciation = $(".entry .lex_ful_pron").text();
    const meaning_element = $(".entry tbody");
    const meaning = meaning_element.children(":not(.head)").map((_, it) => $(it).text()).toArray().join('\n');
    return [origin_spell, pronunciation, meaning];
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
        responseType: 'arraybuffer'
    });
    return pronunciation_response.data;
}

export default async function handler(
    request: VercelRequest,
    response: VercelResponse,
) {
    let spell = request.query.spell as string;
    let db_client = await connect_database();
    let spell_world_query_result = await db_client.query("SELECT word_id FROM Spell_Word WHERE spell = $1", [spell]);
    if (spell_world_query_result.rowCount == 0) {
        let [origin_spell, pronunciation, meaning] = (await fetch_meaning(spell))!!;
        let pronunciation_voice = await fetch_pronunciation(origin_spell);
        try {
            let insert_word_query_result = await db_client.query(`INSERT INTO word (spell, meaning, pronunciation, pronunciation_voice) 
                VALUES ($1, $2, $3, $4) ON CONFLICT (spell) DO UPDATE SET id=word.id RETURNING id`,
                [origin_spell, meaning, pronunciation, pronunciation_voice]);
            // todo: those which spell != origin_spell may have their own pronunciation_voice
            await db_client.query(`INSERT INTO Spell_Word (spell, word_id) VALUES ($1, $2);`, [spell, insert_word_query_result.rows[0].id]);
        } catch (error) {
            console.warn(`failed to insert word ${spell}`);
            console.warn(error);
        }
    }
    let word_query_result = await db_client.query(`
        SELECT word.id, word.spell, word.pronunciation, word.meaning, encode(word.pronunciation_voice, 'base64') as pronunciation_voice 
        FROM word, Spell_Word
        WHERE Spell_Word.spell = $1 and Spell_Word.word_id=word.id`, [spell]);
    response.setHeader('Cache-Control', 'max-age=2630000,s-maxage=2630000');
    response.status(200).json(word_query_result.rows[0]);
}
