import { connect_database } from '$lib/server/database';
import type { Article } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load = (async ({ params }) => {
    const db_client = await connect_database();
    const [query_words_result, query_meta_result] = await Promise.all([
        db_client.query(`select tt_words.spell as spell, word.id as id, User_Word.review_count as review_count
        from (select ROW_NUMBER() over () as index, word as spell from (
            select TRIM(BOTH FROM regexp_split_to_table(content, E'(?=[\.\!\?\, \n])|(?<=[\.\!\?\, \n])')) as word from article where id = $1
        ) as t_words
        where t_words.word <> '') as tt_words
        LEFT JOIN Spell_Word ON tt_words.spell=Spell_Word.spell
        LEFT JOIN Word ON Spell_Word.word_id=Word.id 
        LEFT JOIN User_Word ON Word.id=User_Word.word_id and User_Word.user_id=1
        order by index;`,
            [params.id]
        ),
        db_client.query("select id, title, url from article where id=$1", [params.id])]);
    const words = query_words_result.rows.map(it => ({ spell: it.spell, id: it.id, review_count: it.review_count }));
    const meta = query_meta_result.rows[0];
    return {
        words,
        ...meta
    } as Article;
}) satisfies PageServerLoad;