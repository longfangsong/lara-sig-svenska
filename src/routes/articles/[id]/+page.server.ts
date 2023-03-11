import { connect_database } from '$lib/server/database';
import type { Article } from '$lib/types';
import type { PageServerLoad } from './$types';
import pg from 'pg';
const { Client } = pg;

async function fetch_user_id(db_client: pg.Client, email: string): Promise<number> {
    const query_result = await db_client.query(`INSERT INTO "User"(email) values ($1) ON CONFLICT (email) DO UPDATE SET email=$1 RETURNING id;`, [email]);
    return query_result.rows[0].id;
}

export const load = (async ({ params, locals }) => {
    const [db_client, session] = await Promise.all([connect_database(), locals.getSession()]);
    let user_id: number | null = null;
    if (session?.user?.email !== null) {
        user_id = await fetch_user_id(db_client, session?.user?.email!!);
    }
    const [query_words_result, query_meta_result] = await Promise.all([
        db_client.query(`select tt_words.spell as spell, word.id as id, User_Word.review_count as review_count
        from (select ROW_NUMBER() over () as index, word as spell from (
            select TRIM(BOTH FROM regexp_split_to_table(content, E'(?=[\.\!\?\, \n])|(?<=[\.\!\?\, \n])')) as word from article where id = $1
        ) as t_words
        where t_words.word <> '') as tt_words
        LEFT JOIN Spell_Word ON tt_words.spell=Spell_Word.spell
        LEFT JOIN Word ON Spell_Word.word_id=Word.id 
        LEFT JOIN User_Word ON Word.id=User_Word.word_id and user_id=$2
        order by index;`,
            [params.id, user_id]
        ),
        db_client.query("select id, title, url from article where id=$1", [params.id])]);
    const words = query_words_result.rows.map(it => ({ spell: it.spell, id: it.id, review_count: it.review_count }));
    const meta = query_meta_result.rows[0];
    const article = {
        words,
        ...meta
    } as Article;
    return article;
}) satisfies PageServerLoad;