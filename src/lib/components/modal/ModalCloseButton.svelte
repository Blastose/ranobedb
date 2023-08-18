<script lang="ts">
	import Icon from '$lib/components/icon/Icon.svelte';
	import { melt } from '@melt-ui/svelte';
	import type { Dialog } from '@melt-ui/svelte';

	export let close: Dialog['elements']['close'];
</script>

<button use:melt={$close} class="btn close-button" aria-label="Close" type="button">
	<Icon height="24" width="24" name="close" />
</button>

<style>
	.close-button {
		position: absolute;
		padding: 0.25rem;
		border-radius: 0.5rem;
		right: 0.5rem;
		top: 0.5rem;
	}
</style>
