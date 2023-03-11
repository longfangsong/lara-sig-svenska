import { connect_database } from "$lib/server/database";
import { load } from "cheerio";
import qs from 'querystring';
import type { RequestEvent } from "./$types";

async function fetch_meaning(word: string): Promise<[string, string, string] | null> {
    const url = `https://www.dict.com/swedish-english/${encodeURIComponent(word)}`;
    const response = await fetch(url);
    const $ = load(await response.text());
    const origin_spell = $(".entry .lex_ful_entr").text();
    const pronunciation = $(".entry .lex_ful_pron").text();
    const meaning_element = $(".entry tbody");
    const meaning = meaning_element.children(":not(.head)").map((_, it) => $(it).text()).toArray().join('\n');
    return [origin_spell, pronunciation.trim(), meaning];
}

async function fetch_pronunciation(word: string): Promise<Buffer> {
    const url = `https://ttsmp3.com/makemp3_new.php`;
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
    const urlencoded = new URLSearchParams();
    urlencoded.append("msg", word);
    urlencoded.append("lang", "Astrid");
    urlencoded.append("source", "ttsmp3");
    const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: urlencoded
    };
    let response = await fetch(url, requestOptions);
    let response_json = await response.json();
    let pronunciation_url = response_json['URL'];
    let pronunciation_response = await fetch(pronunciation_url!!);
    return Buffer.from(await pronunciation_response.arrayBuffer());
}

export async function GET({ url }: RequestEvent) {
    let spell = url.searchParams.get('spell');
    let db_client = await connect_database();
    try {
        let spell_world_query_result = await db_client.query("SELECT word_id FROM Spell_Word WHERE spell = $1", [spell]);
        if (spell_world_query_result.rowCount == 0) {
            let [origin_spell, pronunciation, meaning] = (await fetch_meaning(spell!!))!!;
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
        return new Response(JSON.stringify(word_query_result.rows[0]), {
            status: 200,
            headers: {
                'Cache-Control': 'max-age=2630000,s-maxage=2630000'
            }
        });
    } finally {
        await db_client.end();
    }
}
