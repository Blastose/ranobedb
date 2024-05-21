<script lang="ts">
	import '../app.css';
	import Layout from '$lib/components/layout/Layout.svelte';
	import { themeStore } from '$lib/stores/themeStore';
	import { onNavigate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { addToast } from '$lib/components/toast/Toaster.svelte';
	import { getFlash } from 'sveltekit-flash-message';
	import { page } from '$app/stores';

	onNavigate((navigation) => {
		// if (!document.startViewTransition) return;
		// return new Promise((resolve) => {
		// 	document.startViewTransition(async () => {
		// 		resolve();
		// 		await navigation.complete;
		// 	});
		// });
	});

	onMount(() => {
		if (!('theme' in localStorage)) {
			if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
				themeStore.set('dark');
			} else {
				themeStore.set('light');
			}
		} else {
			if (localStorage.getItem('theme') === 'dark') {
				themeStore.set('dark');
			} else if (localStorage.getItem('theme') === 'light') {
				themeStore.set('light');
			}
		}
	});

	// TODO remove later
	function handleKeyDown(e: KeyboardEvent) {
		if (e.key !== '`') return;

		themeStore.toggle();
	}

	export let data;

	const flash = getFlash(page);
	$: if ($flash) {
		addToast({ data: { title: $flash.message, type: $flash.type } });
		$flash = undefined;
	}
</script>

<svelte:document on:keydown={handleKeyDown} />

<svelte:head>
	<script>
		if (!('theme' in localStorage)) {
			if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
				document.documentElement.classList.add('dark');
			}
		} else {
			if (localStorage.getItem('theme') === 'dark') {
				document.documentElement.classList.add('dark');
			}
		}
	</script>
</svelte:head>

<Layout user={data.user} url={data.url}>
	<slot />
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
		animation: 90ms cubic-bezier(0.4, 0, 1, 1) both fade-out,
			300ms cubic-bezier(0.4, 0, 0.2, 1) both slide-to-left;
	}

	:root::view-transition-new(root) {
		animation: 210ms cubic-bezier(0, 0, 0.2, 1) 90ms both fade-in,
			300ms cubic-bezier(0.4, 0, 0.2, 1) both slide-from-right;
	}
</style>
