import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from "axios";
import pg from 'pg';
const { Client } = pg;
import { load } from "cheerio";

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

export default async function handler(
    request: VercelRequest,
    response: VercelResponse,
) {
    let limit = request.query.limit;
    let offset = request.query.offset;
    let [sveriges_radio_response, db_client] = await Promise.all([
        axios.get("https://sverigesradio.se/radioswedenpalattsvenska"),
        connect_database()
    ]);
    const $ = load(sveriges_radio_response.data);
    const elements = $("h2.heading.heading-link.h2>a.heading");
    let all_titles = elements.map((_, element) => $(element).text()).toArray();
    await db_client.query('BEGIN');
    let exists = await Promise.all(all_titles.map(async (title) => {
        try {
            let result = await db_client.query("select id from article where title = $1;", [title]);
            return result.rows.length != 0;
        } catch (error) {
            return false;
        }
    }));
    let titles_to_fetch = all_titles.filter((_, i) => !exists[i]);
    let detail_urls_to_fetch = elements.filter(i => !exists[i]).map((_, element) => "https://sverigesradio.se" + $(element).attr("href")).toArray();
    let fetched_detail_responses = await Promise.all(detail_urls_to_fetch.map(async (it) => {
        let result = await axios.get(it);
        return result;
    }));
    let fetched_detail_pages = fetched_detail_responses.map(detail_response => load(detail_response!!.data));
    let fetched_detail_contents = fetched_detail_pages.map(($_detail_page) => {
        let publication_preamble = $_detail_page(".publication-preamble").text();
        let details = $_detail_page(".article-details__section").text();
        let content = publication_preamble + "\n" + details;
        return content.replace(/\s\s+/g, "\n");
    });
    await Promise.all(titles_to_fetch.map(async (title, i) => {
        try {
            await db_client.query('insert into article (title, url, content) values ($1, $2, $3)', [title, detail_urls_to_fetch[i], fetched_detail_contents[i]]);
        } catch (error) {
            db_client.query('ROLLBACK');
            response.status(500);
            return;
        }
    }));
    await db_client.query('COMMIT');
    let result_query = await db_client.query('select id, title, url, content from article order by id desc limit $1 offset $2', [limit, offset]);
    let result = result_query.rows.map(({ id, title, url, content }) => {
        return { id, title, url, content };
    })
    response.setHeader('Cache-Control', 's-maxage=43200');
    response.status(200).json(result);
}