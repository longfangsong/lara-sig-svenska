import { connect_database } from '$lib/server/database';
import type { PageServerLoad } from './$types';

export const load = (async () => {
    const db_client = await connect_database();
    const query_result = await db_client.query("select id, title, url from article order by create_time desc limit 10 offset 0");
    let articles = query_result.rows.map((row) => {
        return {
            id: row.id,
            title: row.title,
            url: row.url
        }
    });
    return { articles };
}) satisfies PageServerLoad;