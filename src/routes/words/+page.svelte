<script lang="ts">
	import axios from "axios";
	import { onMount } from "svelte";
	import Word from "./Word.svelte";

	interface Word {
		id: string;
		spell: string;
		meaning: string;
		pronunciation: string;
		review_count: string;
	}
	let words: Array<Word> = [];
	onMount(async () => {
		const res = await axios.get(`/api/user_words?user_id=1`);
		words = res.data;
	});
</script>

<svelte:head>
	<title>About</title>
	<meta name="Words" content="Your words" />
</svelte:head>

<div>
	{#each words as word}
		<Word {word} />
	{/each}
</div>
