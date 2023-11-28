<script lang="ts">
	import Icon from '../icon/Icon.svelte';

	export let text: string;
	export let submitting: boolean;
	export let delayed: boolean;
	export let name: string | undefined = undefined;
	export let value: string | undefined = undefined;
</script>

<button {name} {value} disabled={submitting} type="submit" class="button" class:loading={delayed}>
	{#if !delayed}
		{text}
	{:else}
		<Icon name="loading" class="animate-spin" />
	{/if}
</button>

<style>
	.button {
		width: 100%;
		border-radius: 0.375rem;
		display: flex;
		justify-content: center;
		padding: 0.5rem 1rem;
		color: white;
		background-color: var(--primary-500);
		transition: background-color 150ms;
	}

	.button:focus {
		outline: 2px solid transparent;
		outline-offset: 2px;

		box-shadow: 0 0 0 2px var(--primary-600);
	}

	.button:hover {
		background-color: var(--primary-800);
	}

	.button.loading {
		background-color: var(--primary-800);
	}
</style>
