<script lang="ts">
	import Word from "./Word.svelte";
	import type { UserWord } from "$lib/types";
	import { page } from "$app/stores";
	import { navigating } from '$app/stores';
    import { Spinner, Table } from "sveltestrap"

	/** @type {import('./$types').PageData} */
	export let data: { userWords: Array<UserWord> };
	const debugData: Array<UserWord> = [
		{
			id: "125", 
			spell: "andra", 
			pronunciation: "[andra]", 
			meaning: JSON.parse(`[{"name":"num","meanings":["second","second","second"]}]`), 
			example_sentence: "",
			pronunciation_voice:"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",
			review_count: 1,
		},
		{
			id: "28", 
			spell: "mer", 
			pronunciation: "[meːr]", 
			meaning: JSON.parse(`[{"name":"adv","meanings":["more"]}]`),
			example_sentence: "",
			pronunciation_voice:"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",
			review_count: 0,
		}
	]
</script>

<svelte:head>
	<title>Words</title>
	<meta name="Words" content="Your words" />
</svelte:head>

<div class="m-2 overflow-scroll">
{#if $page.data.session}
	{#if $navigating}
		<div class="spinner-holder d-flex justify-content-center mt-5">
			<Spinner color="primary" class="loading"></Spinner>
		</div>
	{:else}
		<Table bordered>
			<thead>
  			  <tr>
  			    <th>Spell</th>
  			    <th>Pronunciation</th>
  			    <th>Meaning</th>
  			    <th>Example</th>
  			    <th>Review Count</th>
  			    <th>Review</th>
  			  </tr>
  			</thead>
			<tbody>
				{#each data.userWords as word}
				<Word {word} />
				{/each}
			</tbody>
		</Table>
	{/if}
{:else if process.env.DEBUG}
	<Table bordered class="words">
		<thead>
  		  <tr>
  		    <th>Spell</th>
  		    <th>Pronunciation</th>
  		    <th>Meaning</th>
  		    <th>Example</th>
  		    <th>Review Count</th>
  		    <th>Review</th>
  		  </tr>
  		</thead>
		<tbody>
			{#each debugData as word}
			<Word {word} />
			{/each}
		</tbody>
	</Table>
{:else}
<h1>Access Denied</h1>
<p>
  <a href="/auth/signin">
    You must be signed in to view this page
  </a>
</p>
{/if}
</div>

<style>
	:global(.words) {
		margin: 0;
		padding: 0;
	}
</style>