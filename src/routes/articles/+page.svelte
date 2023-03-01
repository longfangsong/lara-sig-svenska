<script lang="ts">
	import type { ArticleMeta } from "$lib/types";

	/** @type {import('./$types').PageData} */
	export let data: { articles: Array<ArticleMeta> };
</script>

<svelte:head>
	<title>Articles</title>
	<meta name="articles" content="Articles for reading and listening." />
</svelte:head>

<div>
	{#each data.articles as article}
		<h1><a href={`/articles/${article.id}`}>{article.title}</a></h1>
	{/each}
</div>
