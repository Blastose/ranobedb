<script lang="ts">
	import { createDialog, melt } from '@melt-ui/svelte';
	import { fade, fly } from 'svelte/transition';
	import Icon from '$lib/components/icon/Icon.svelte';
	import Sidebar from '$lib/components/layout/sidebar/Sidebar.svelte';
	import type { User } from 'lucia';
	import { writable } from 'svelte/store';
	import { quintOut } from 'svelte/easing';
	import { getSidebarStoreContext } from '$lib/stores/sidebarStore';

	export let user: User | null;
	const customOpen = writable(false);

	const {
		elements: { trigger, overlay, content, close, portalled, title },
	} = createDialog({
		forceVisible: true,
		preventScroll: false,
		open: customOpen,
	});

	function handleNavigation() {
		customOpen.set(false);
	}

	const sidebarStore = getSidebarStoreContext();

	function openSidebar() {
		sidebarStore.set('open');
	}
</script>

<div class="flex items-center lg:hidden pr-4">
	<button type="button" use:melt={$trigger} class="btn rounded-sm p-1" aria-label="Open sidebar">
		<Icon name="menu" />
	</button>
</div>
<div class="hidden items-center lg:flex pr-4">
	<button type="button" on:click={openSidebar} class="btn rounded-sm p-1" aria-label="Open sidebar">
		<Icon name="menu" />
	</button>
</div>

<div use:melt={$portalled}>
	{#if $customOpen}
		<div use:melt={$overlay} class="modal-bg" transition:fade={{ duration: 150 }} />
		<div
			use:melt={$content}
			class="modal-drawer"
			transition:fly={{
				x: -256,
				duration: 450,
				opacity: 1,
				easing: quintOut,
			}}
		>
			<button use:melt={$close} aria-label="Close" class="drawer close-btn btn">
				<Icon name="close" />
			</button>

			<p class="hidden" use:melt={$title}>Sidebar</p>
			<Sidebar {user} {handleNavigation} isDrawer={true} />
		</div>
	{/if}
</div>

<style>
	.modal-drawer {
		position: fixed;
		left: 0;
		top: 0;
		z-index: 999999;
		height: 100dvh;
		width: 100%;
		max-width: 16rem;
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
