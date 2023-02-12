import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from "axios";
import { load } from "cheerio";
export default async function handler(
    _request: VercelRequest,
    response: VercelResponse,
) {
    let sveriges_radio_response = await axios
        .get("https://sverigesradio.se/radioswedenpalattsvenska");
    const $ = load(sveriges_radio_response.data);
    const elements = $("h2.heading.heading-link.h2>a.heading");
    let titles = elements.map((_, element) => $(element).text()).toArray();
    let detail_urls = elements.map((_, element) => "https://sverigesradio.se" + $(element).attr("href")).toArray();
    let detail_responses = await Promise.all(detail_urls.map((it) => axios.get(it)));
    let detail_pages = detail_responses.map(detail_response => load(detail_response!!.data));
    let detail_contents = detail_pages.map(($_detail_page) => {
        let publication_preamble = $_detail_page(".publication-preamble").text();
        let details = $_detail_page(".article-details__section").text();
        let content = publication_preamble + "\n" + details;
        return content.replace(/\s\s+/g, "\n");
    });
    let result = titles.map((title, i) => {
        let url = detail_urls[i];
        let content = detail_contents[i];
        return { title, url, content };
    })
    response.status(200).json(result);
}