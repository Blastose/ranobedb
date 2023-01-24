<script lang="ts">
	import drawer from '$lib/stores/drawer';
	import { fade } from 'svelte/transition';
	import largeScreen from '$lib/stores/largeScreen';
</script>

{#if $drawer && !$largeScreen}
	<button
		class="overlay"
		aria-label="close sidebar"
		type="button"
		on:click={() => {
			drawer.set(false);
		}}
		transition:fade={{ duration: 150 }}
	/>
{/if}

<style>
	.overlay {
		z-index: 50;
		width: 100%;
		height: 100vh;
		position: fixed;
		-webkit-tap-highlight-color: transparent;
		background-color: rgba(0, 0, 0, 0.473);
	}
</style>
