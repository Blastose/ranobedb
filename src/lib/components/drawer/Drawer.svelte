<script lang="ts">
	import drawer from '$lib/stores/drawer';
	import { fade, fly } from 'svelte/transition';
	import { cubicInOut } from 'svelte/easing';
</script>

<div class="lg:hidden">
	{#if $drawer}
		<button
			class="overlay"
			on:click={() => {
				drawer.set(!$drawer);
			}}
			transition:fade={{ duration: 150 }}
		/>
		<div class="drawer" transition:fly={{ x: -200, duration: 150, easing: cubicInOut, opacity: 1 }}>
			<slot />
		</div>
	{/if}
</div>

<style>
	.drawer {
		position: fixed;
		z-index: 50;
	}

	.overlay {
		z-index: 50;
		width: 100%;
		height: 100vh;
		position: fixed;
		background-color: rgba(0, 0, 0, 0.473);
	}
</style>
