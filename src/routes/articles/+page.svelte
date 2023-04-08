<script lang="ts">
	import type { ArticleMeta } from "$lib/types";
	import { navigating } from '$app/stores';
	/** @type {import('./$types').PageData} */
	export let data: { articles: Array<ArticleMeta> };
</script>

<svelte:head>
	<title>Articles</title>
	<meta name="articles" content="Articles for reading and listening." />
</svelte:head>

<div>
	{#if $navigating}
		<p>Loading</p>
	{:else}
		{#each data.articles as article}
			<h1><a href={`/articles/${article.id}`}>{article.title}</a></h1>
		{/each}
	{/if}
</div>
