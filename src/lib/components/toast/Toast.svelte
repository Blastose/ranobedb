<script lang="ts">
	import { fly } from 'svelte/transition';
	import { onMount } from 'svelte';
	import Icon from '$lib/components/icon/Icon.svelte';
	import type { ToastData } from './toast';

	interface Props {
		toast: { id: string; data: ToastData; duration: number };
		removeToast: (id: string) => void;
	}

	let { toast, removeToast }: Props = $props();

	let remaining = 0;
	let timer: ReturnType<typeof setTimeout> | null = null;
	let start = 0;
	let paused = $state(false);

	function startTimer() {
		if (timer) return;
		start = Date.now();
		timer = setTimeout(() => removeToast(toast.id), remaining);
	}

	function pause() {
		paused = true;
		if (timer) {
			clearTimeout(timer);
			timer = null;
			remaining -= Date.now() - start;
		}
	}

	function resume() {
		paused = false;
		if (remaining > 0) startTimer();
	}

	onMount(() => {
		remaining = toast.duration;
		startTimer();
		return () => {
			if (timer) clearTimeout(timer);
			timer = null;
		};
	});
</script>

<div
	in:fly={{ duration: 150, x: '100%' }}
	out:fly={{ duration: 150, x: '100%' }}
	class="toast-container shadow-md"
	role="status"
	onmouseenter={pause}
	onmouseleave={resume}
>
	<div class="toast-progress-container">
		<div
			class="toast-progress"
			style="--toast-duration: {toast.duration}ms; animation-play-state: {paused
				? 'paused'
				: 'running'};"
		></div>
	</div>

	<div class="toast-content pt-6">
		<div class="flex gap-2">
			{#if toast.data.type === 'success'}
				<div class="text-green-500">
					<Icon name="checkCircle" />
				</div>
			{:else if toast.data.type === 'error'}
				<div class="text-red-500">
					<Icon name="alertCircle" />
				</div>
			{/if}
			<section>
				<h3 class="font-semibold">
					{toast.data.title}
				</h3>

				{#if toast.data.description}
					<div>
						{toast.data.description}
					</div>
				{/if}
			</section>
		</div>
		<button class="close-btn btn" onclick={() => removeToast(toast.id)} aria-label="close">
			<Icon name="close" />
		</button>
	</div>
</div>

<style>
	.toast-container {
		position: relative;
		border-radius: 0.5rem;
		background-color: var(--bg-light1);
	}

	:global(.dark) .toast-container {
		background-color: var(--bg-dark1);
	}

	.toast-content {
		position: relative;
		display: flex;
		width: 24rem;
		max-width: calc(100vw - 2rem);
		align-items: center;
		justify-content: space-between;
		padding: 1.5rem 1rem 1rem 1rem;
	}

	.toast-progress-container {
		position: absolute;
		left: 1.25rem;
		top: 0.5rem;
		height: 0.25rem;
		width: 10%;
		overflow: hidden;
		border-radius: 9999px;
		background-color: #00000033;
	}

	.toast-progress {
		height: 100%;
		width: 100%;
		background-color: var(--primary-500);
		animation: toast-fill var(--toast-duration, 5000ms) linear forwards;
	}

	@keyframes toast-fill {
		from {
			transform: translateX(-100%);
		}
		to {
			transform: translateX(0%);
		}
	}
</style>
