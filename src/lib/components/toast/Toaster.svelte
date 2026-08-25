<script lang="ts" module>
	import type { ToastData } from './toast';
	import { browser } from '$app/environment';

	type ToastItem = {
		id: string;
		data: ToastData;
		duration: number;
	};

	let toasts = $state<ToastItem[]>([]);
	let count = 0;

	export function addToast(props: { data: ToastData }) {
		if (!browser) return;
		const id = `toast-${count++}`;
		const duration = 5000;
		toasts.push({ id, data: props.data, duration });
		return id;
	}

	export function removeToast(id: string) {
		toasts = toasts.filter((t) => t.id !== id);
	}
</script>

<script lang="ts">
	import Toast from './Toast.svelte';
	import { flip } from 'svelte/animate';
</script>

<div class="toaster-container">
	{#each toasts as toast (toast.id)}
		<div animate:flip={{ duration: 500 }}>
			<Toast {toast} {removeToast} />
		</div>
	{/each}
</div>

<style>
	.toaster-container {
		position: fixed;
		right: 0;
		top: 0;
		z-index: 999999;
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
