<script lang="ts">
    import axios from "axios";
    import type { UserWord } from "$lib/types";
    import { Button } from "sveltestrap"

    export let word: UserWord = {
        id: "",
        spell: "",
        meaning: [],
        example_sentence: "",
        pronunciation: "",
        pronunciation_voice: "",
        review_count: 0,
    };

    async function review() {
        await axios.patch(`/api/user_words?word_id=${word.id}`);
        word.review_count += 1;
    }
</script>

<tr class="word">
    <th class="spell" scope="row">
        {word.spell}
    </th>
    <td class="pronunciation">
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
    </td>
    <td class="meaning">
        {#each word.meaning as partOfSpeech}
            <div class="part-of-speech-name">{ partOfSpeech.name }</div>
            {#each partOfSpeech.meanings as meaning}
                <div class="meaning">{ meaning }</div>
            {/each}
        {/each}
    </td>
    <td>
        {word.example_sentence}
    </td>
    <td class="review_count">
        {word.review_count}
    </td>
    <td><Button on:click={review}>Review</Button></td>
</tr>

<style>
    /* todo: style audio */
    .pronunciation {
        text-align: center;
    }
    .pronunciation-voice audio {
        max-width: 100px;
    }
    .part-of-speech-name {
        font-size: smaller;
        color: rgb(0, 162, 255);
    }
</style>
