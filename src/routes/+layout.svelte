<script lang="ts">
	import { run } from 'svelte/legacy';
	import '../app.css';
	import Layout from '$lib/components/layout/Layout.svelte';
	import { createThemeStore } from '$lib/stores/themeStore';
	import { onNavigate } from '$app/navigation';
	import { addToast } from '$lib/components/toast/Toaster.svelte';
	import { getFlash } from 'sveltekit-flash-message';
	import { page } from '$app/state';
	import { setContext } from 'svelte';
	import { writable } from 'svelte/store';
	import { getDisplayPrefsUser } from '$lib/display/prefs';
	import Progress from '$lib/components/layout/Progress.svelte';
	import { beforeNavigate } from '$app/navigation';
	import { updated } from '$app/state';
	import { createRelCalStore } from '$lib/stores/releaseCalendarViewStore';

	beforeNavigate(({ willUnload, to }) => {
		if (updated.current && !willUnload && to?.url) {
			location.href = to.url.href;
		}
	});

	onNavigate((navigation) => {
		// if (!document.startViewTransition) return;
		// return new Promise((resolve) => {
		// 	document.startViewTransition(async () => {
		// 		resolve();
		// 		await navigation.complete;
		// 	});
		// });
	});

	// TODO remove later
	function handleKeyDown(e: KeyboardEvent) {
		if (e.key !== '`') return;

		theme.toggle();
	}

	let { data, children } = $props();

	const flash = getFlash(page);
	run(() => {
		if ($flash) {
			addToast({ data: { title: $flash.message, type: $flash.type } });
			$flash = undefined;
		}
	});

	const displayPrefs = writable();
	run(() => {
		displayPrefs.set(getDisplayPrefsUser(data.user));
	});
	setContext('displayPrefs', displayPrefs);

	const sidebarOpen = writable<'open' | 'closed'>();
	run(() => {
		sidebarOpen.set('open');
	});
	setContext('sidebar', sidebarOpen);

	const theme = createThemeStore();
	run(() => {
		theme.set(data.theme);
	});
	setContext('theme', theme);

	const relCalView = createRelCalStore();
	run(() => {
		relCalView.set('compact');
	});
	setContext('relCal', relCalView);

	setContext('today', data.today);
</script>

<svelte:document onkeydown={handleKeyDown} />

<Progress />

<Layout user={data.user} url={data.url}>
	{@render children?.()}
</Layout>

<style>
	@keyframes fade-in {
		from {
			opacity: 0;
		}
	}

	@keyframes fade-out {
		to {
			opacity: 0;
		}
	}

	@keyframes slide-from-right {
		from {
			transform: translateX(30px);
		}
	}

	@keyframes slide-to-left {
		to {
			transform: translateX(-30px);
		}
	}

	:root::view-transition-old(root) {
		animation:
			90ms cubic-bezier(0.4, 0, 1, 1) both fade-out,
			300ms cubic-bezier(0.4, 0, 0.2, 1) both slide-to-left;
	}

	:root::view-transition-new(root) {
		animation:
			210ms cubic-bezier(0, 0, 0.2, 1) 90ms both fade-in,
			300ms cubic-bezier(0.4, 0, 0.2, 1) both slide-from-right;
	}
</style>
