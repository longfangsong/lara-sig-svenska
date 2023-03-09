import { connect_database } from '$lib/server/database';
import type { UserWord } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
    const [db_client, session] = await Promise.all([connect_database(), locals.getSession()]);
    let query_result = await db_client.query(`
        SELECT
            word.id as id,
            word.spell as spell,
            word.meaning as meaning,
            word.pronunciation as pronunciation,
            encode(word.pronunciation_voice, 'base64') as pronunciation_voice,
            user_word.review_count as review_count
        FROM word, user_word, "User"
        WHERE user_word.user_id = "User".id AND user_word.word_id = word.id AND "User".email=$1
        ORDER BY user_word.review_count DESC;
    `, [session?.user?.email]);
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