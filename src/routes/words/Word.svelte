<script lang="ts">
    import { onMount } from "svelte";
    import axios from "axios";

    interface Word {
        id: string;
        spell: string;
        meaning: string;
        pronunciation: string;
        review_count: string;
    }
    export let word: Word = {
        id: "",
        spell: "",
        meaning: "",
        pronunciation: "",
        review_count: "",
    };

    async function review() {
        let response = await axios.patch(
            `/api/user_words?user_id=1&word_id=${word.id}`
        );
        word.review_count += 1;
    }
</script>

<div class="word">
    <span class="spell">
        {word.spell}
    </span>
    <span class="pronunciation">
        <audio controls>
            <source
                src={"data:audio/mpeg;base64," + word.pronunciation}
                type="audio/mpeg"
            />
        </audio>
    </span>
    <span class="meaning">
        {@html word.meaning}
    </span>
    <span class="review_count">
        {word.review_count}
    </span>
    <button on:click={review}>Review</button>
</div>

<style>
    /* todo: style audio */
    .meaning {
        widows: 100px;
    }
</style>
