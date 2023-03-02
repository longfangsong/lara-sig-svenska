<script lang="ts">
    import axios from "axios";
    import type { UserWord } from "$lib/types";

    export let word: UserWord = {
        id: "",
        spell: "",
        meaning: "",
        pronunciation: "",
        pronunciation_voice: "",
        review_count: 0,
    };

    async function review() {
        await axios.patch(`/api/user_words?user_id=1&word_id=${word.id}`);
        word.review_count += 1;
    }
</script>

<div class="word">
    <span class="spell">
        {word.spell}
    </span>
    <span class="pronunciation">
        <div class="pronunciation-text">
            {word.pronunciation}
        </div>
        <div class="pronunciation-voice">
            <audio controls>
                <source
                    src={"data:audio/mpeg;base64," + word.pronunciation_voice}
                    type="audio/mpeg"
                />
            </audio>
        </div>
    </span>
    <span class="meaning">
        {@html word.meaning.replace(/\n/g, "<br />")}
    </span>
    <span class="review_count">
        {word.review_count}
    </span>
    <button on:click={review}>Review</button>
</div>

<style>
    /* todo: style audio */
    .word {
        display: flex;
        flex-direction: row;
        align-items: center;
        margin-bottom: 16px;
        justify-content: space-between;
    }
    .spell {
        width: 50px;
    }
    .pronunciation {
        display: inline-block;
        width: 100px;
        text-align: center;
    }
    .pronunciation-voice audio {
        width: 100px;
    }
    .meaning {
        display: inline-block;
        width: 300px;
    }
</style>
