import { connect_database } from '$lib/server/database';
import type { Article } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load = (async ({ params }) => {
    const db_client = await connect_database();
    const [query_words_result, query_meta_result] = await Promise.all([
        db_client.query(`select word from (
  select TRIM(BOTH FROM regexp_split_to_table(content, E'(?=[\.\!\?\, \n])|(?<=[\.\!\?\, \n])')) as word from article where id = $1
) as t_words
where t_words.word <> '';`, [params.id]),
        db_client.query("select id, title, url from article where id=$1", [params.id])]);
    const words = query_words_result.rows.map(it => it.word);
    const meta = query_meta_result.rows[0];
    return {
        words,
        ...meta
    } as Article;
}) satisfies PageServerLoad;