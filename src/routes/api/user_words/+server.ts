import { error } from '@sveltejs/kit';
import { connect_database } from '$lib/server/database';
import type { RequestEvent } from './$types';

export async function POST({ request, locals }: RequestEvent) {
    const [{ spell, id }, session, db_client] =
        await Promise.all([request.json(), locals.getSession(), connect_database()]);
    if (spell) {
        const query_result = await db_client.query(`insert into user_word 
                (select "User".id, word.id from "User", word where "User".email=$1 and word.spell=$2)
            returning word_id;`, [session?.user?.email, spell]);
        return new Response(JSON.stringify({ id: query_result.rows[0].word_id }));
    } else if (id) {
        const query_result = await db_client.query(`insert into user_word 
                (select "User".id, $2 from "User" where "User".email=$1)
            returning word_id;`, [session?.user?.email, id]);
        return new Response(JSON.stringify({ id: query_result.rows[0].word_id }));
    } else {
        error(400, "Please set `spell` or `id` in  url's searchParams")
    }
}

export async function PATCH({ url, locals }: RequestEvent) {
    const word_id = url.searchParams.get('word_id');
    const [session, db_client] =
        await Promise.all([locals.getSession(), connect_database()]);
    const email = session?.user?.email;
    await db_client.query(`
        UPDATE user_word
        SET review_count = review_count + 1
        WHERE user_id = (select id from "User" where email=$1) AND word_id = $2;
    `, [email, word_id]);
    return new Response(null, { status: 200 });
}