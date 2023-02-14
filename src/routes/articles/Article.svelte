<script lang="ts">
    import axios from "axios";
    import { createPopperActions } from "svelte-popperjs";
    interface Article {
        title: string;
        content: string;
        url: string;
    }
    export let article: Article = {
        url: "/",
        title: "Loading",
        content: "Loading",
    };
    const words = article.content.replace(/\n/g, " \\n ").split(" ");
    let showTooltipFor = -1;
    let tooltipContent = "";

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
            showTooltipFor = index;
        }, 1000);
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

    const [popperRef, popperContent] = createPopperActions({
        placement: "auto",
        strategy: "absolute",
    });
    const extraOpts = {
        modifiers: [{ name: "offset", options: { offset: [0, 1] } }],
    };
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
                        <button>Add</button>
                    </div>
                {:else}
                    <span
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
</style>
