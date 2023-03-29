<script lang="ts">
	import '../app.css';
	import '$lib/components/sidebar/sidebar.css';
	import { onMount } from 'svelte';
	import { theme } from '$lib/stores/theme';
	import Layout from '$lib/components/layout/Layout.svelte';
	import largeScreen from '$lib/stores/largeScreen';
	import drawer from '$lib/stores/drawer';
	import type { PageData } from './$types';

	const monitorScreenSize = (node: Window) => {
		const windowQuery = node.matchMedia('(min-width: 1024px)');
		const match = (e: MediaQueryListEvent) => {
			if (e.matches) {
				largeScreen.set(true);
				drawer.set(false);
			} else {
				largeScreen.set(false);
			}
		};

		if (!windowQuery.matches) {
			largeScreen.set(false);
		}

		windowQuery.addEventListener('change', match);

		return {
			destroy() {
				windowQuery.removeEventListener('change', match);
			}
		};
	};

	onMount(() => {
		if (!('theme' in localStorage)) {
			if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
				theme.set('dark');
			} else {
				theme.set('light');
			}
		} else {
			if (localStorage.getItem('theme') === 'dark') {
				theme.set('dark');
			} else if (localStorage.getItem('theme') === 'light') {
				theme.set('light');
			}
		}
	});

	export let data: PageData;
</script>

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

<svelte:window use:monitorScreenSize />

<Layout pathname={data.pathname} user={data.user}>
	<slot />
</Layout>
