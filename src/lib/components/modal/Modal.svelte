<script lang="ts">
	import ModalCloseButton from '$lib/components/modal/ModalCloseButton.svelte';
	import { fly, fade } from 'svelte/transition';
	import { navigating } from '$app/stores';
	import AddBookModal from '$lib/components/book/AddBookModal.svelte';
	import modalBook from '$lib/stores/modalBook';
	import { beforeNavigate } from '$app/navigation';

	const escapeClose = (e: KeyboardEvent) => {
		if (e.key === 'Escape') {
			modalBook.set(null);
			document.removeEventListener('keydown', escapeClose);
		}
	};

	const useEscToClose = (_node: HTMLButtonElement) => {
		document.addEventListener('keydown', escapeClose);

		return {
			destroy() {
				document.removeEventListener('keydown', escapeClose);
			}
		};
	};

	$: {
		if ($navigating && $modalBook) {
			modalBook.set(null);
		}
	}

	let tabArrayIndex: number;
	let dialogContainer: HTMLButtonElement;
	let focusableElements: NodeList;

	const closeOnDialogContainer = (e: Event) => {
		if (e.target === dialogContainer) {
			modalBook.set(null);
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

	const focusTrap = (node: HTMLButtonElement) => {
		tabArrayIndex = 0;
		focusableElements = node.querySelectorAll('input, button, select, a');

		document.addEventListener('keydown', handleTab);
		return {
			destroy() {
				document.removeEventListener('keydown', handleTab);
			}
		};
	};

	beforeNavigate((navigation) => {
		if ($modalBook) {
			navigation.cancel();
			modalBook.set(null);
		}
	});
</script>

{#if $modalBook}
	<button
		class="dialog-container"
		use:focusTrap
		use:useEscToClose
		bind:this={dialogContainer}
		on:click={closeOnDialogContainer}
		on:keydown={(e) => {
			if (e.target === dialogContainer) {
				e.preventDefault();
			}
		}}
		transition:fade|global={{ duration: 150 }}
	>
		<dialog
			aria-label="Add/Edit book to reading list"
			open={Boolean($modalBook)}
			transition:fly|global={{ y: -10, duration: 150 }}
		>
			<ModalCloseButton
				onClose={() => {
					modalBook.set(null);
				}}
			/>
			<AddBookModal
				book={$modalBook.book}
				status={$modalBook.status}
				startDate={$modalBook.startDate}
				finishDate={$modalBook.finishDate}
			/>
		</dialog>
	</button>
{/if}

<style>
	.dialog-container {
		position: fixed;
		display: flex;
		place-items: center;
		text-align: left;
		cursor: default;
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
