<script lang="ts">
	import { createDialog, melt } from '@melt-ui/svelte';
	import { fade, fly } from 'svelte/transition';
	import Icon from '$lib/components/icon/Icon.svelte';
	import Sidebar from '$lib/components/layout/sidebar/Sidebar.svelte';
	import type { User } from 'lucia';
	import { writable } from 'svelte/store';
	import { quintOut } from 'svelte/easing';

	export let user: User | undefined;
	const customOpen = writable(false);

	const {
		elements: { trigger, overlay, content, close, portalled }
	} = createDialog({
		forceVisible: true,
		preventScroll: false,
		open: customOpen
	});

	function handleNavigation() {
		customOpen.set(false);
	}
</script>

<button use:melt={$trigger} aria-label="Open sidebar">
	<Icon name="menu" />
</button>

<div use:melt={$portalled}>
	{#if $customOpen}
		<div
			use:melt={$overlay}
			class="fixed inset-0 z-[99999] bg-black/50"
			transition:fade={{ duration: 150 }}
		/>
		<div
			use:melt={$content}
			class="fixed left-0 top-0 z-[999999] h-screen w-full max-w-[16rem] bg-[var(--bg-light)] dark:bg-[var(--bg-dark)]
            shadow-lg focus:outline-none"
			transition:fly={{
				x: -256,
				duration: 450,
				opacity: 1,
				easing: quintOut
			}}
		>
			<button
				use:melt={$close}
				aria-label="Close"
				class="absolute right-[10px] z-[999999] top-[10px] inline-flex h-6 w-6
             items-center justify-center rounded-full"
			>
				<Icon name="close" />
			</button>

			<Sidebar {user} {handleNavigation} isDrawer={true} />
		</div>
	{/if}
</div>
