<script lang="ts">
	import Icon from '$lib/components/icon/Icon.svelte';

	export let onClose: () => void;
</script>

<button class="btn close-button" on:click={onClose} aria-label="Close modal">
	<Icon height="24" width="24" name="close" />
</button>

<style>
	.close-button {
		position: absolute;
		padding: 0.25rem;
		border-radius: 0.5rem;
		right: 0.5rem;
	}
</style>
