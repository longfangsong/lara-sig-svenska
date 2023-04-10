<script lang="ts">
    import axios from "axios";
    import type { UserWord } from "$lib/types";
    import { Button } from "sveltestrap"

    export let word: UserWord = {
        id: "",
        spell: "",
        meaning: "",
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
        {@html word.meaning.replace(/\n/g, "<br />")}
    </td>
    <td></td>
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
</style>
