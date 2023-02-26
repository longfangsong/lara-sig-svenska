<script lang="ts">
    import { onMount } from "svelte";

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
    // onMount(() => {
    //     console.log(word.pronunciation);
    //     const blob = new Blob([word.pronunciation], { type: "audio/mpeg" });
    //     const fr = new FileReader();
    //     fr.onload = (e) => console.log(e.target?.result);
    //     fr.readAsDataURL(blob);
    //     console.log(blob);
    //     player.src = URL.createObjectURL(blob);
    // });
</script>

<div class="word">
    <span class="spell">
        {word.spell}
    </span>
    <div class="pronunciation">
        <audio controls>
            <source
                src={"data:audio/mpeg;base64," + word.pronunciation}
                type="audio/mpeg"
            />
        </audio>
    </div>
    <!-- <div class="meaning">
        {@html word.meaning}
    </div> -->
    <div class="review_count">
        {word.review_count}
    </div>
</div>
