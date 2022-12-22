<script lang="ts">
	import { modal } from '$lib/stores/modalStore';
	import ModalCloseButton from '$lib/components/modal/ModalCloseButton.svelte';
	import { fade } from 'svelte/transition';
	import { navigating } from '$app/stores';
	import AddBookModal from '$lib/components/book/AddBookModal.svelte';
	import { browser } from '$app/environment';
	import modalBook from '$lib/stores/modalBook';

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
			document.removeEventListener('keydown', escapeClose);
		}
	};
	const removeEscToClose = () => {
		document.removeEventListener('keydown', escapeClose);
	};

	const escToCloseModal = () => {
		document.addEventListener('keydown', escapeClose);
	};

	$: {
		if (browser && $modalBook) {
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
		if ($navigating && $modal) {
			modal.set(false);
			enableScroll();
			removeEscToClose();
		}
	}

	let tabArrayIndex: number;
	let dialogContainer: HTMLDivElement;
	let focusableElements: NodeList;

	const closeOnDialogContainer = (e: Event) => {
		if (e.target === dialogContainer) {
			modal.set(false);
		}
	};

	const handleTab = (e: KeyboardEvent) => {
		if (e.shiftKey && e.key === 'Tab') {
			e.preventDefault();
			tabArrayIndex = tabArrayIndex - 1 < 0 ? focusableElements.length - 1 : tabArrayIndex - 1;
			(focusableElements[tabArrayIndex] as HTMLElement).focus();
		} else if (e.key === 'Tab') {
			e.preventDefault();
			tabArrayIndex = (tabArrayIndex + 1) % focusableElements.length;
			(focusableElements[tabArrayIndex] as HTMLElement).focus();
		}
	};

	const focusTrap = (node: HTMLDivElement) => {
		tabArrayIndex = 0;
		focusableElements = node.querySelectorAll('input, button, select, a');

		document.addEventListener('keydown', handleTab);
		return {
			destroy() {
				document.removeEventListener('keydown', handleTab);
			}
		};
	};
</script>

{#if $modal && $modalBook}
	<div
		class="dialog-container"
		use:focusTrap
		bind:this={dialogContainer}
		on:click={closeOnDialogContainer}
		on:keydown={(e) => {
			if (e.target === dialogContainer) {
				e.preventDefault();
			}
		}}
		transition:fade
	>
		<dialog aria-label="Add/Edit book to reading list" open={$modal}>
			<ModalCloseButton
				onClose={() => {
					modal.set(false);
				}}
			/>
			<AddBookModal
				book={$modalBook.book}
				status={$modalBook.status}
				startDate={$modalBook.startDate}
				finishDate={$modalBook.finishDate}
			/>
		</dialog>
	</div>
{/if}

<style>
	.dialog-container {
		position: fixed;
		display: flex;
		place-items: center;
		z-index: 51;
		width: 100%;
		height: 100vh;
		background-color: rgba(0, 0, 0, 0.473);
	}

	dialog {
		border-radius: 0.1rem;
		width: 100%;
		height: 100%;
		overflow-y: auto;
	}

	@media (min-width: 768px) {
		dialog {
			border-radius: 0.375rem;
			width: 640px;
			max-height: 445px;
		}
	}
</style>
