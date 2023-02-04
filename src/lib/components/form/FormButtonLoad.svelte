<script lang="ts">
	import Icon from '$lib/components/icon/Icon.svelte';
	export let text: string;
	export let value: string;
	export let name: string;
	export let loading: boolean;
	export let showLoadingSpinner: boolean;
	export let onClick: (e: MouseEvent) => void;
	export let altColor = false;
</script>

<button
	type="submit"
	{name}
	{value}
	class="button"
	class:alt-color={altColor}
	disabled={loading}
	on:click={(e) => {
		onClick(e);
	}}
>
	{#if showLoadingSpinner}
		<Icon class="animate-spin absolute" height="24" width="24" name="loading" />
	{/if}
	<span class="w-full">{text}</span>
</button>

<style>
	.button {
		width: 100%;
		transition-duration: 150ms;
		border-radius: 0.375rem;
		padding: 0.25rem 2rem;
		color: white;
		background-color: var(--primary-500);
		gap: 1rem;
	}

	.button:hover {
		background-color: var(--primary-800);
	}

	.button.alt-color {
		background-color: #8585a1;
	}

	.button.alt-color:hover {
		background-color: #5e5e72;
	}

	:global(.dark) .button.alt-color {
		background-color: #737387;
	}

	:global(.dark) .button.alt-color:hover {
		background-color: #5e5e72;
	}
</style>
