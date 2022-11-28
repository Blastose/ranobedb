<script lang="ts">
	import Icon from '$lib/components/icon/Icon.svelte';

	export let text: string;
	export let loading: boolean;
</script>

<button
	disabled={loading}
	type="submit"
	class="button {loading ? 'loading' : ''} 
  focus:outline-none focus:ring focus:ring-primary-600"
	>{#if !loading}
		{text}
	{:else}
		<Icon class="animate-spin" height="24" width="24" name="loading" />
	{/if}
</button>

<style>
	.button {
		width: 100%;
		transition-duration: 150ms;
		border-radius: 0.375rem;
		display: flex;
		justify-content: center;
		padding: 0.5rem 1rem;
		color: white;
		background-color: var(--primary-500);
	}

	.button:hover {
		background-color: var(--primary-800);
	}

	.button.loading {
		background-color: var(--primary-800);
	}
</style>
