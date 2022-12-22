<script lang="ts">
	import { modal } from '$lib/stores/modalStore';
	import ModalCloseButton from '$lib/components/modal/ModalCloseButton.svelte';
	import { fade } from 'svelte/transition';
	import { navigating } from '$app/stores';
	import AddBookModal from '$lib/components/book/AddBookModal.svelte';
	import { browser } from '$app/environment';

	let prevBodyOverflow: string;
	let prevBodyPosition: string;
	let prevBodyWidth: string;
	let scrollY: number;

	const disableScroll = () => {
		scrollY = window.scrollY;
		prevBodyPosition = document.body.style.position;
		prevBodyOverflow = document.body.style.overflow;
		prevBodyWidth = document.body.style.width;
		document.body.style.overflow = 'hidden';
	};
	const enableScroll = () => {
		document.body.style.position = prevBodyPosition || '';
		document.body.style.overflow = prevBodyOverflow || '';
		document.body.style.width = prevBodyWidth || '';
		window.scrollTo(0, scrollY);
	};

	const escapeClose = (e: KeyboardEvent) => {
		if (e.key === 'Escape') {
			modal.set(false);
		}
	};
	const removeEscToClose = () => {
		document.removeEventListener('keydown', escapeClose);
	};

	const escToCloseModal = () => {
		document.addEventListener('keydown', escapeClose, { once: true });
	};

	$: {
		if (browser) {
			if ($modal === true) {
				disableScroll();
				escToCloseModal();
			} else {
				enableScroll();
				removeEscToClose();
			}
		}
	}

	$: {
		if ($navigating) {
			modal.set(false);
			enableScroll();
			removeEscToClose();
		}
	}

	let dialogContainer: HTMLButtonElement;
	let dialog: HTMLDialogElement;

	const closeOnDialogContainer = (e: Event) => {
		if (e.target === dialogContainer) {
			modal.set(false);
		}
	};

	const focusTrap = (node: HTMLButtonElement) => {
		const focusableElements = node.querySelectorAll('a');
	};
</script>

{#if $modal}
	<button
		class="dialog-container"
		use:focusTrap
		bind:this={dialogContainer}
		on:click={closeOnDialogContainer}
		transition:fade
	>
		<dialog aria-label="Add/Edit book to reading list" open={$modal} bind:this={dialog}>
			<ModalCloseButton
				onClose={() => {
					modal.set(false);
				}}
			/>
			<AddBookModal
				book={{
					title: 'あした、裸足でこい。',
					cover_image_file_name: '00330198-bc5c-4762-943a-066a1ef647ae'
				}}
				status={null}
				startDate={null}
				finishDate={null}
			/>
		</dialog>
	</button>
{/if}

<style>
	.dialog-container {
		position: fixed;
		display: flex;
		place-items: center;
		z-index: 51;
		text-align: left;
		cursor: default;
		width: 100%;
		height: 100vh;
		background-color: rgba(0, 0, 0, 0.473);
	}

	dialog {
		position: relative;
		width: 100%;
		height: 100%;
		overflow-y: auto;
	}

	@media (min-width: 768px) {
		dialog {
			border-radius: 0.375rem;
			width: 640px;
			height: min(100vh, 400px);
		}
	}
</style>
