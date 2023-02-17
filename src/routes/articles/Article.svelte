<script lang="ts">
    import axios from "axios";
    import { onMount } from "svelte";
    import { createPopperActions } from "svelte-popperjs";
    interface Article {
        id: string;
        title: string;
        content: string;
        url: string;
    }
    export let article: Article = {
        id: "0",
        url: "/",
        title: "Loading",
        content: "Loading",
    };
    const words = article.content.replace(/\n/g, " \\n ").split(" ");
    let showTooltipFor = -1;
    let tooltipContent = "";
    let words_info: Array<WordInfo> = [];
    let fetchTimeout: NodeJS.Timeout | undefined = undefined;
    let disappearTimeout: NodeJS.Timeout | undefined = undefined;
    function wordMouseIn(word: string, index: number) {
        clearTimeout(fetchTimeout);
        fetchTimeout = setTimeout(async () => {
            clearTimeout(disappearTimeout);
            let response = await axios.get(
                `/api/words?word=${word.replace(/[\.\?!,]/, "")}`
            );
            tooltipContent = response.data.meaning;
            for (let [i, word_info] of words_info.entries()) {
                if (i == index) {
                    word_info.word_id = response.data.id;
                }
            }
            showTooltipFor = index;
        }, 1000);
    }
    async function wordClick(word: string, index: number) {
        clearTimeout(fetchTimeout);
        clearTimeout(disappearTimeout);
        showTooltipFor = -1;
        let response = await axios.get(
            `/api/words?word=${word.replace(/[\.\?!,]/, "")}`
        );
        tooltipContent = response.data.meaning;
        showTooltipFor = index;
    }
    function wordMouseOut() {
        clearTimeout(fetchTimeout);
        clearTimeout(disappearTimeout);
        disappearTimeout = setTimeout(() => {
            showTooltipFor = -1;
        }, 5000);
    }
    function closePopper() {
        clearTimeout(disappearTimeout);
        showTooltipFor = -1;
    }

    async function add(word: string, index: number) {
        let response = await axios.post(`/api/user_words`, {
            user_id: 1,
            spell: word.replace(/[\.\?!,]/, ""),
        });
        for (let [i, word_info] of words_info.entries()) {
            if (i == index) {
                word_info.word_id = response.data.id;
                word_info.review_count = 0;
            }
        }
    }
    const [popperRef, popperContent] = createPopperActions({
        placement: "auto",
        strategy: "absolute",
    });
    const extraOpts = {
        modifiers: [{ name: "offset", options: { offset: [0, 1] } }],
    };
    interface WordInfo {
        word_id: number | null;
        review_count: number | null;
    }
    onMount(async () => {
        const res = await axios.get(
            `/api/user_passage_words?user_id=1&passage_id=${article.id}`
        );
        words_info = res.data;
        console.log(words_info);
    });
    function word_class(word_info: WordInfo) {
        if (!word_info) {
            console.warn(`word_info = ${word_info}`);
            return "";
        }
        if (word_info.word_id === null) {
            return "";
        } else if (word_info.review_count === null) {
            return "not-added";
        } else {
            return `review-${word_info.review_count}`;
        }
    }
</script>

<div>
    <h1><a href={article.url}>{article.title}</a></h1>
    <p class="content">
        {#each words as word, index}
            {#if word === "\\n"}
                <br />
            {:else if word !== ""}
                {#if showTooltipFor === index}
                    <span
                        use:popperRef
                        class={word_class(words_info[index])}
                        on:click={() => wordClick(word, index)}
                        on:mouseenter={() => wordMouseIn(word, index)}
                        on:mouseleave={wordMouseOut}>{word}</span
                    >{" "}
                    <div
                        class="popper"
                        use:popperContent={extraOpts}
                        on:click={closePopper}
                    >
                        <table>
                            {@html tooltipContent}
                        </table>
                        <button on:click={() => add(word, index)}>Add</button>
                    </div>
                {:else}
                    <span
                        class={word_class(words_info[index])}
                        on:mouseenter={() => wordMouseIn(word, index)}
                        on:mouseleave={wordMouseOut}>{word}</span
                    >{" "}
                {/if}
            {/if}
        {/each}
    </p>
</div>

<style>
    .content span {
        cursor: pointer;
    }
    .popper {
        background: gray;
        max-width: 250px;
        color: white;
        font-family: Georgia, "Times New Roman", Times, serif;
        border-radius: 6px;
    }

    .not-added {
        background: rgb(180, 180, 180);
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

    .review-7 {
        background: rgb(0, 255, 0);
    }
</style>
