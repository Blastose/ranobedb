<script lang="ts">
	import Icon from '$lib/components/icon/Icon.svelte';
	import type { ToastData } from '$lib/components/toast/toast';

	interface Props {
		type: ToastData['type'];
		children?: import('svelte').Snippet;
	}

	let { type, children }: Props = $props();

	let open = $state(true);

	function hideAlert() {
		open = false;
	}
</script>

{#if open}
	<div class="alert" class:success={type === 'success'} class:error={type === 'error'}>
		<button type="button" class="close-button" onclick={hideAlert} aria-label="Hide alert"
			><Icon name="close" /></button
		>
		{@render children?.()}
	</div>
{/if}

<style>
	.alert {
		padding: 0.5rem 2rem 0.5rem 1rem;
		border-radius: 0.375rem;
		border-width: 1px;
		position: relative;
	}

	.success {
		border-color: rgb(74 222 128);
		color: rgb(22 101 52);
		background-color: rgb(134 239 172);
	}

	.error {
		border-color: rgb(248 113 113);
		color: rgb(127 29 29);
		background-color: rgb(252 165 165);
	}

	.close-button {
		position: absolute;
		right: 0.25rem;
	}
</style>
