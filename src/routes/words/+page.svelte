<script lang="ts">
	import Word from "./Word.svelte";
	import type { UserWord } from "$lib/types";
	import { page } from "$app/stores";
	import { navigating } from '$app/stores';
    import { Spinner } from "sveltestrap"

	/** @type {import('./$types').PageData} */
	export let data: { userWords: Array<UserWord> };
</script>

<svelte:head>
	<title>About</title>
	<meta name="Words" content="Your words" />
</svelte:head>

{#if $page.data.session}
<div class="mt-2">
	{#if $navigating}
		<div class="spinner-holder d-flex justify-content-center mt-5">
			<Spinner color="primary" class="loading"></Spinner>
		</div>
	{:else}
		{#each data.userWords as word}
			<Word {word} />
		{/each}
	{/if}
</div>
{:else}
<h1>Access Denied</h1>
<p>
  <a href="/auth/signin">
    You must be signed in to view this page
  </a>
</p>
{/if}
