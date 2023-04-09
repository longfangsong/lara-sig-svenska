<script lang="ts">
	import type { ArticleMeta } from "$lib/types";
	import { navigating } from '$app/stores';
    import { Card, CardBody, ListGroup, ListGroupItem, Spinner } from "sveltestrap"
	/** @type {import('./$types').PageData} */
	export let data: { articles: Array<ArticleMeta> };
</script>

<svelte:head>
	<title>Articles</title>
	<meta name="articles" content="Articles for reading and listening." />
</svelte:head>

<div class="m-2 p-2">
	{#if $navigating}
		<div class="spinner-holder d-flex justify-content-center mt-4">
			<Spinner color="primary" class="loading"></Spinner>
		</div>
	{:else}
		<ListGroup>
		{#each data.articles as article}
			<ListGroupItem tag="a" href={`/articles/${article.id}`} action>{article.title}</ListGroupItem>
		{/each}
		</ListGroup>
	{/if}
</div>

<style>
	.loading {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}
</style>