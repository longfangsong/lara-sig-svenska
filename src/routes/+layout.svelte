<script lang="ts">
	import Header from "./Header.svelte";
	import { page } from "$app/stores";
	import "./styles.css";
</script>

<div class="app">
	<Header />
	<div class="signedInStatus">
		<p class="nojs-show loaded">
			{#if $page.data.session}
				{#if $page.data.session.user?.image}
					<span
						style="background-image: url('{$page.data.session.user
							.image}')"
						class="avatar"
					/>
				{/if}
				<span class="signedInText">
					<small>Signed in as</small><br />
					<strong
						>{$page.data.session.user?.email ??
							$page.data.session.user?.name}</strong
					>
				</span>
				<a
					href="/auth/signout"
					class="button"
					data-sveltekit-preload-data="off">Sign out</a
				>
			{:else}
				<span class="notSignedInText">You are not signed in</span>
				<a
					href="/auth/signin"
					class="buttonPrimary"
					data-sveltekit-preload-data="off">Sign in</a
				>
			{/if}
		</p>
	</div>
	<main>
		<slot />
	</main>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		max-width: 64rem;
		margin: 0 auto;
		box-sizing: border-box;
	}
</style>
