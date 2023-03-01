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

async function fetch_url(title: string, url: string, db_client: pg.Client) {
    const response = await axios.get(url);
    const $ = load(response!!.data);
    let content = $(".publication-preamble").text();
    let details = $(".article-details__section p")
        .map((_, it) => $(it).text())
        .toArray();
    details.pop();
    content += details.join("");
    const create_time = new Date($("time.publication-metadata__item").attr('datetime') || '');
    await db_client.query('INSERT INTO article (title, content, create_time, url) VALUES ($1, $2, $3, $4);', [title, content, create_time, url]);
}

export default async function handler(_request: VercelRequest, response: VercelResponse) {
    let [sveriges_radio_response, db_client] = await Promise.all([
        axios.get("https://sverigesradio.se/radioswedenpalattsvenska"),
        connect_database()
    ]);
    const $ = load(sveriges_radio_response.data);
    const elements = $("h2.heading.heading-link.h2>a.heading");
    let all_titles = elements.map((_, element) => $(element).text()).toArray();
    let exists = await Promise.all(all_titles.map(async (title) => {
        try {
            let query_title_result = await db_client.query("select id from article where title = $1;", [title]);
            return query_title_result.rows.length != 0;
        } catch (error) {
            return false;
        }
    }));
    let titles_to_fetch = all_titles.filter((_, i) => !exists[i]);
    let detail_urls_to_fetch = elements.filter(i => !exists[i]).map((_, element) => "https://sverigesradio.se" + $(element).attr("href")).toArray();
    await Promise.all(detail_urls_to_fetch.map(async (url, i) => {
        const title = titles_to_fetch[i];
        await fetch_url(title, url, db_client);
    }));
    response.status(200).send("");
}