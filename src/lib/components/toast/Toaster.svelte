<script lang="ts" context="module">
	export type ToastData = {
		title: string;
		type: 'success' | 'error' | 'info';
		description?: string;
	};

	const {
		elements,
		helpers,
		states: { toasts },
		actions: { portal }
	} = createToaster<ToastData>();

	export const addToast = helpers.addToast;
</script>

<script lang="ts">
	import { createToaster } from '@melt-ui/svelte';
	import Toast from './Toast.svelte';
	import { flip } from 'svelte/animate';
</script>

<div class="toaster-container" use:portal>
	{#each $toasts as toast (toast.id)}
		<div animate:flip={{ duration: 500 }}>
			<Toast {elements} {toast} />
		</div>
	{/each}
</div>

<style>
	.toaster-container {
		position: fixed;
		right: 0;
		top: 0;
		z-index: 99999;
		margin: 1rem;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.5rem;
	}

	@media (min-width: 768px) {
		.toaster-container {
			bottom: 0;
			top: auto;
		}
	}
</style>
