<script lang="ts">
	import { createProgress, melt, type Toast, type ToastsElements } from '@melt-ui/svelte';
	import { fly } from 'svelte/transition';
	import Icon from '$lib/components/icon/Icon.svelte';
	import { writable } from 'svelte/store';
	import { onMount } from 'svelte';
	import type { ToastData } from './toast';

	export let elements: ToastsElements;
	$: ({ content, title, description, close } = elements);

	export let toast: Toast<ToastData>;
	$: ({ data, id, getPercentage } = toast);

	const percentage = writable(0);
	const {
		elements: { root: progress },
		options: { max },
	} = createProgress({
		max: 100,
		value: percentage,
	});

	onMount(() => {
		let frame: number;
		const updatePercentage = () => {
			percentage.set(getPercentage());
			frame = requestAnimationFrame(updatePercentage);
		};
		frame = requestAnimationFrame(updatePercentage);

		return () => cancelAnimationFrame(frame);
	});
</script>

<div
	use:melt={$content(id)}
	in:fly={{ duration: 150, x: '100%' }}
	out:fly={{ duration: 150, x: '100%' }}
	class="toast-container shadow-md"
>
	<div use:melt={$progress} class="toast-progress-container">
		<div
			class="toast-progress"
			style={`transform: translateX(-${100 - (100 * ($percentage ?? 0)) / ($max ?? 1)}%)`}
		/>
	</div>

	<div class="toast-content pt-6">
		<div class="flex gap-2">
			{#if data.type === 'success'}
				<div class="text-green-500">
					<Icon name="checkCircle" />
				</div>
			{:else if data.type === 'error'}
				<div class="text-red-500">
					<Icon name="alertCircle" />
				</div>
			{/if}
			<section>
				<h3 use:melt={$title(id)} class="font-semibold">
					{data.title}
				</h3>

				{#if data.description}
					<div use:melt={$description(id)}>
						{data.description}
					</div>
				{/if}
			</section>
		</div>
		<button use:melt={$close(id)} class="close-btn btn">
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
	}
</style>
