<script lang="ts">
	import toast from '$lib/stores/toast';
	import { fade } from 'svelte/transition';
	import Icon from '$lib/components/icon/Icon.svelte';
	import { navigating } from '$app/stores';

	const useHide = (node: HTMLDivElement) => {
		let timer = setTimeout(() => {
			toast.set(null);
		}, 2500);

		return {
			destroy() {
				clearTimeout(timer);
			}
		};
	};

	$: {
		if ($navigating) {
			toast.set(null);
		}
	}
</script>

{#if $toast}
	<div use:useHide class="toast-container" transition:fade={{ duration: 250 }}>
		<div class="toast shadow-md">
			{#if $toast.icon}
				<Icon
					class={$toast.icon === 'checkCircle' ? 'text-green-400' : ''}
					height="24"
					width="24"
					name={$toast.icon}
				/>
			{/if}
			<p>{$toast.message}</p>
			{#if $toast.closeButton}
				<button
					on:click={() => {
						toast.set(null);
					}}
				>
					<Icon height="24" width="24" name="close" />
				</button>
			{/if}
		</div>
	</div>
{/if}

<style>
	.toast-container {
		position: fixed;
		display: flex;
		align-items: flex-end;
		justify-content: center;
		height: 100vh;
		width: 100%;
		z-index: 1000;
		pointer-events: none;
	}

	.toast {
		display: flex;
		place-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		margin-bottom: 1rem;
		border-radius: 0.375rem;
		pointer-events: auto;
		background-color: white;
	}

	:global(.dark) .toast {
		background-color: #545555;
		color: white;
	}
</style>
