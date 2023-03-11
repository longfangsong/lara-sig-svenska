<script lang="ts">
    import type { Article, Word, WordInArticle } from "$lib/types";
    import axios from "axios";
    /** @type {import('./$types').PageData} */
    export let data: Article;
    import { createPopperActions } from "svelte-popperjs";
    const [popperRef, popperContent] = createPopperActions({
        placement: "bottom",
        strategy: "fixed",
    });
    const extraOpts = {
        modifiers: [{ name: "offset", options: { offset: [0, 1] } }],
    };
    let showTooltipForIndex: number | null = null;
    let tooltipWord: Word | null = null;
    function closePopper() {
        showTooltipForIndex = null;
        tooltipWord = null;
    }
    async function openPopper(index: number) {
        tooltipWord = null;
        showTooltipForIndex = index;
        const word = data.words[index];
        let response = await axios.get(`/api/words?spell=${word.spell}`);
        tooltipWord = response.data;
        data.words.forEach((other_word, index) => {
            if (other_word.spell.toLowerCase() === word.spell.toLowerCase()) {
                data.words[index].id = tooltipWord?.id || null;
                data.words[index].review_count = word?.review_count || null;
            }
        });
    }
    async function addWord() {
        const id = tooltipWord?.id;
        if (id) {
            await axios.post(`/api/user_words`, {
                id,
            });
            data.words.forEach((word, index) => {
                if (word.id === id) {
                    data.words[index].review_count = 0;
                }
            });
        }
    }
    function word_class(word_info: WordInArticle) {
        if (!word_info) {
            return "word";
        }
        if (word_info.id === null) {
            return "word";
        } else if (word_info.review_count === null) {
            return "word not-added";
        } else {
            return `word review-${word_info.review_count}`;
        }
    }
</script>

<svelte:head>
    <title>{data.title}</title>
    <meta name={data.title} content={data.title} />
</svelte:head>

<div>
    <h1>{data.title}</h1>
    <a href={data.url}>Article on Origin Site</a>
    <p class="content">
        {#each data.words as word, index}
            {#if word.spell === "." || word.spell === "!" || word.spell === "?" || word.spell === "\n"}
                <span>{word.spell}</span><br />
            {:else if word.spell === ","}
                <span>{word.spell}</span>
            {:else if showTooltipForIndex === index}
                {" "}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <span
                    use:popperRef
                    class={word_class(word)}
                    on:click={() => openPopper(index)}>{word.spell}</span
                >
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <div
                    class="popper"
                    use:popperContent={extraOpts}
                    on:click={closePopper}
                >
                    {#if tooltipWord !== null}
                        <h2>{tooltipWord.spell}</h2>
                        <span>{tooltipWord.pronunciation}</span>
                        <audio controls>
                            <source
                                src={"data:audio/mpeg;base64," +
                                    tooltipWord.pronunciation_voice}
                                type="audio/mpeg"
                            />
                        </audio>
                        <p>
                            {@html tooltipWord.meaning.replace(/\n/g, "<br />")}
                        </p>
                        <button on:click={addWord}>Add</button>
                    {:else}
                        <div class="lds-dual-ring" />
                    {/if}
                </div>
            {:else}
                {" "}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <span
                    class={word_class(word)}
                    on:click={() => openPopper(index)}>{word.spell}</span
                >
            {/if}
        {/each}
    </p>
</div>

<style>
    .word {
        cursor: pointer;
    }
    .word:hover {
        background: rgb(225, 225, 225);
    }
    .popper {
        background: gray;
        max-width: 250px;
        color: white;
        font-family: Georgia, "Times New Roman", Times, serif;
        border-radius: 6px;
        padding: 8px;
    }

    .popper > h2 {
        margin: 0;
        font-weight: bold;
    }

    .popper > span {
        font-style: italic;
    }

    .popper > button,
    .popper > audio {
        width: 100%;
    }
    .lds-dual-ring {
        display: inline-block;
        width: 80px;
        height: 80px;
        padding-right: 12px;
    }
    .lds-dual-ring:after {
        content: " ";
        display: block;
        width: 64px;
        height: 64px;
        margin: 8px;
        border-radius: 50%;
        border: 6px solid #fff;
        border-color: #fff transparent #fff transparent;
        animation: lds-dual-ring 1.2s linear infinite;
    }
    @keyframes lds-dual-ring {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
    .review-0 {
        background: rgb(255, 0, 0);
    }

    .review-1 {
        background: rgb(255, 64, 0);
    }

    .review-2 {
        background: rgb(255, 128, 0);
    }

    .review-3 {
        background: rgb(255, 192, 0);
    }

    .review-4 {
        background: rgb(255, 255, 0);
    }

    .review-5 {
        background: rgb(192, 255, 0);
    }

    .review-6 {
        background: rgb(128, 255, 0);
    }

    .review-7 {
        background: rgb(64, 255, 0);
    }

    .review-8 {
        background: rgb(0, 255, 0);
    }
</style>
