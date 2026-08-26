<script lang="ts">
	import { Dialog } from 'bits-ui';
	import { fade, fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import Icon from '$lib/components/icon/Icon.svelte';
	import Sidebar from '$lib/components/layout/sidebar/Sidebar.svelte';
	import type { User } from '$lib/server/lucia/lucia';
	import { getSidebarStoreContext } from '$lib/stores/sidebarStore';

	interface Props {
		user: User | null;
	}

	let { user }: Props = $props();

	let open = $state(false);

	function handleNavigation() {
		open = false;
	}

	const sidebarStore = getSidebarStoreContext();

	function openSidebar() {
		sidebarStore.set('open');
	}
</script>

<Dialog.Root bind:open>
	<div class="flex items-center pr-4 lg:hidden">
		<Dialog.Trigger type="button" class="btn rounded-full p-1" aria-label="Open sidebar">
			<Icon name="menu" />
		</Dialog.Trigger>
	</div>
	<div class="hidden items-center pr-4 lg:flex">
		<button
			type="button"
			onclick={openSidebar}
			class="btn rounded-full p-1"
			aria-label="Open sidebar"
		>
			<Icon name="menu" />
		</button>
	</div>

	<Dialog.Portal>
		<Dialog.Overlay forceMount>
			{#snippet child({ props, open: overlayOpen })}
				{#if overlayOpen}
					<div {...props} class="modal-bg" transition:fade={{ duration: 150 }}></div>
				{/if}
			{/snippet}
		</Dialog.Overlay>
		<Dialog.Content forceMount preventScroll={false} onOpenAutoFocus={(e) => e.preventDefault()}>
			{#snippet child({ props, open: contentOpen })}
				{#if contentOpen}
					<div
						{...props}
						class="modal-drawer"
						transition:fly={{
							x: -240,
							duration: 450,
							opacity: 1,
							easing: quintOut,
						}}
					>
						<Dialog.Close type="button" aria-label="Close" class="drawer close-btn btn">
							<Icon name="close" />
						</Dialog.Close>

						<Dialog.Title class="hidden">Sidebar</Dialog.Title>
						<Sidebar {user} {handleNavigation} isDrawer={true} />
					</div>
				{/if}
			{/snippet}
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>

<style>
	.modal-drawer {
		position: fixed;
		left: 0;
		top: 0;
		z-index: 999999;
		height: 100dvh;
		width: 100%;
		max-width: 240px;
		background-color: var(--bg-light);
		outline: 2px solid transparent;
		outline-offset: 2px;
	}

	:global(.dark) .modal-drawer {
		background-color: var(--bg-dark);
	}

	.drawer.close-btn {
		top: 1rem;
	}
</style>
