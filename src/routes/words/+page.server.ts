import { connect_database } from '$lib/server/database';
import type { UserWord } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load = (async () => {
    const db_client = await connect_database();
    let query_result = await db_client.query(`
        SELECT
            word.id as id,
            word.spell as spell,
            word.meaning as meaning,
            word.pronunciation as pronunciation,
            encode(word.pronunciation_voice, 'base64') as pronunciation_voice,
            user_word.review_count as review_count
        FROM word, user_word
        WHERE user_word.user_id = $1 AND user_word.word_id = word.id
        ORDER BY user_word.review_count DESC;
    `, [1]);
    const userWords: Array<UserWord> = query_result.rows.map((row) => {
        return {
            id: row.id,
            spell: row.spell,
            meaning: row.meaning,
            pronunciation: row.pronunciation,
            pronunciation_voice: row.pronunciation_voice,
            review_count: row.review_count
        }
    });
    return { userWords };
}) satisfies PageServerLoad;