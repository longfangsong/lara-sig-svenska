import { connect_database } from "$lib/server/database";
import { load, type CheerioAPI } from "cheerio";
import qs from 'querystring';
import type { RequestEvent } from "./$types";
import { ChatSession } from "bard-easy-api";
import type { Word, PartOfSpeech } from "$lib/types";

interface AnalyzingWord {
    origin_spell: string,
    pronunciation: string,
    part_of_speeches: Array<PartOfSpeech>
}

function isWord(object: AnalyzingWord | PartOfSpeech): object is AnalyzingWord {
    return (object as AnalyzingWord).origin_spell !== undefined;
}

async function bard_meaning(word: string): Promise<AnalyzingWord> {
    let session = await ChatSession.new();
    let response = await session!.send(`look up Swedish word: "${word}" in dictionary, output the result in this format: {"spell": "<word>", "pronunciation": "<IPA of the word>", "part_of_speech": "<part of speech, in abbreviation like adj, adv, v, n, etc>", "meaning": "<English meaning>"}`);
    const firstOpenBraceIndex = response.indexOf("{");
    const firstCloseBraceIndex = response.lastIndexOf("}");
    const jsonString = response.slice(firstOpenBraceIndex, firstCloseBraceIndex + 1);
    const jsonObject = JSON.parse(jsonString);
    let pronunciation = jsonObject.pronunciation;
    if (pronunciation.startsWith('/')) {
        pronunciation = pronunciation.replace('/', '');
    }
    if (!pronunciation.startsWith('[')) {
        pronunciation = `[${pronunciation}]`;
    }
    return {
        origin_spell: word,
        pronunciation: pronunciation,
        part_of_speeches: [
            { name: jsonObject.part_of_speech, meanings: [jsonObject.meaning] }
        ]
    }
}

async function fetch_meaning(word: string): Promise<[string, string, string]> {
    const url = `https://www.dict.com/swedish-english/${encodeURIComponent(word)}`;
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/113.0',
            'Pragma': 'no-cache'
        }
    });
    const $ = load(await response.text());
    let analyzed = analyze($);
    if (analyzed.part_of_speeches.length == 0) {
        analyzed = await bard_meaning(word);
    }
    return [analyzed.origin_spell, analyzed.pronunciation, JSON.stringify(analyzed.part_of_speeches)];
}

function analyze($: CheerioAPI): AnalyzingWord {
    const rows = $(".entry td>span");
    let result: Word = {
        origin_spell: "",
        pronunciation: "",
        part_of_speeches: []
    }
    let current: Word | PartOfSpeech = result;
    for (let span of rows) {
        if (span.attribs.class.includes("lex_ful_entr")) {
            result.origin_spell = $(span).text().trim();
        } else if (span.attribs.class.includes("lex_ful_pron")) {
            result.pronunciation = $(span).text().trim();
        } else if (span.attribs.class.includes("lex_ful_morf")) {
            if ($(span).text().trim() == "phr") break;
            if (!isWord(current)) {
                result.part_of_speeches.push(current);
            }
            current = {
                name: $(span).text().trim(),
                meanings: []
            }
        } else if (span.attribs.class.includes("lex_ful_tran")) {
            if (isWord(current)) {
                console.warn(`lex_ful_tran should not be in Word for ${result}`);
            }
            (current as PartOfSpeech).meanings.push($(span).text().trim());
        }
    }
    if (!isWord(current)) {
        result.part_of_speeches.push(current);
    }
    return result;
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
