<script lang="ts">
    import type { Article } from "$lib/types";
    /** @type {import('./$types').PageData} */
    export let data: Article;
</script>

<svelte:head>
    <title>{data.title}</title>
    <meta name={data.title} content={data.title} />
</svelte:head>

<div>
    <h1>{data.title}</h1>
    <a href={data.url}>Article on Origin Site</a>
    <p class="content">
        {#each data.words as word}
            {#if word === "." || word === "!" || word === "?" || word === "\n"}
                <span>{word}</span><br />
            {:else if word === ","}
                <span>{word}</span>
            {:else}
                {" "}<span>{word}</span>
            {/if}
        {/each}
    </p>
</div>
