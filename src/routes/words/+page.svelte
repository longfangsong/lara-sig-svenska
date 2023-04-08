<script lang="ts">
	import Word from "./Word.svelte";
	import type { UserWord } from "$lib/types";
	import { page } from "$app/stores";
	import { navigating } from '$app/stores';

	/** @type {import('./$types').PageData} */
	export let data: { userWords: Array<UserWord> };
</script>

<svelte:head>
	<title>About</title>
	<meta name="Words" content="Your words" />
</svelte:head>
{#if $page.data.session}
<div>
	{#if $navigating}
		<p>Loading</p>
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
