<script lang="ts">
    import type { Article, Word, WordInArticle } from "$lib/types";
    import axios from "axios";
    /** @type {import('./$types').PageData} */
    export let data: Article;
    import { Badge, Button, Col, Container, Popover, Row, Spinner } from "sveltestrap"

    let showTooltipForIndex: number | null = null;
    let wordsInfo: Array<Word | null> = data.words.map(() => null);
    let popoverRefs: Array<Popover | null> = data.words.map(() => null);
    function closeAllPopovers() {
        for (let popover of popoverRefs) {
            if (popover !== null) {
                popover.$set({"isOpen": false});
            }
        }
    }
    async function loadWord(index: number) {
        closeAllPopovers();
        while (wordsInfo.length < data.words.length) {
            wordsInfo.push(null);
        }
        const word = data.words[index];
        let response = await axios.get(`/api/words?spell=${word.spell}`);
        wordsInfo[index] = response.data;
        wordsInfo[index]!!.meaning = JSON.parse(wordsInfo[index]?.meaning as any as string);
        data.words.forEach((other_word, other_word_index) => {
            if (other_word.spell.toLowerCase() === word.spell.toLowerCase()) {
                data.words[other_word_index].id = wordsInfo[index]?.id || null;
                data.words[other_word_index].review_count = word?.review_count || null;
            }
        });
    }
    async function addWord(index: number) {
        const id = wordsInfo[index]?.id;
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

<!-- @ts-ignore -->
<div class="p-2">
    <h1>{data.title}</h1>
    <a class="btn btn-primary btn-sm" href={data.url}>Article on Origin Site</a>
    <p class="content">
        {#each data.words as word, index}
            {#if word.spell === "." || word.spell === "!" || word.spell === "?" || word.spell === "\n"}
                <span>{word.spell}</span><br />
            {:else if word.spell === ","}
                <span>{word.spell}</span>
            {:else}
                {" "}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <span
                    id={`word-${index}`}
                    class={word_class(word)}
                    on:click={() => loadWord(index)}
                >{word.spell}</span>
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <Popover 
                    placement="bottom" 
                    target={`word-${index}`} 
                    class="popper"
                    bind:this={popoverRefs[index]}
                    dismissible
                >
                    {#if wordsInfo[index] !== null}
                        <h2>{wordsInfo[index]?.spell}</h2>
                        <span>{wordsInfo[index]?.pronunciation}</span>
                        <audio controls class="popper-audio">
                            <source
                                src={"data:audio/mpeg;base64," +
                                    wordsInfo[index]?.pronunciation_voice}
                                type="audio/mpeg"
                            />
                        </audio>
                        <p>
                            {#each wordsInfo[index]?.meaning || [] as partOfSpeech}
                                <div class="part-of-speech-name">{ partOfSpeech.name }</div>
                                {#each partOfSpeech.meanings as meaning}
                                    <div class="meaning">{ meaning }</div>
                                {/each}
                            {/each}
                        </p>
                        <Container>
                            <Row>
                                <Col xs="6"><Button on:click={() => addWord(index)}>Add</Button></Col>
                                <Col xs="6"><Button color="danger" on:click={closeAllPopovers}>Close</Button></Col>
                            </Row>
                        </Container>
                    {:else}
                        <Spinner color="primary" class="loading"></Spinner>
                    {/if}
                </Popover>
            {/if}
        {/each}
    </p>
</div>

<style>
    .word {
        cursor: pointer;
        color: black;
        text-decoration: none;
    }
    .word:hover {
        background: rgb(225, 225, 225);
    }
    .popper-audio {
        display: block;
        width: 200px;
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

    .part-of-speech-name {
        font-size: smaller;
        color: rgb(0, 162, 255);
    }
</style>
