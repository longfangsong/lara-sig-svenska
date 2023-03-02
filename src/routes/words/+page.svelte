<script lang="ts">
	import Word from "./Word.svelte";
	import type { UserWord } from "$lib/types";

	/** @type {import('./$types').PageData} */
	export let data: { userWords: Array<UserWord> };
</script>

<svelte:head>
	<title>About</title>
	<meta name="Words" content="Your words" />
</svelte:head>

<div>
	{#each data.userWords as word}
		<Word {word} />
	{/each}
</div>
