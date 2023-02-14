<script lang="ts">
	import { onMount } from "svelte";
	import axios from "axios";
	import Article from "./Article.svelte";

	interface Article {
		title: string;
		content: string;
		url: string;
	}
	let articles: Array<Article> = [];

	onMount(async () => {
		const res = await axios.get(`/api/passages?limit=10&offset=0`);
		articles = res.data;
	});
</script>

<svelte:head>
	<title>Articles</title>
	<meta name="articles" content="Articles for reading and listening." />
</svelte:head>

<div>
	{#each articles as article}
		<Article {article} />
	{/each}
</div>
