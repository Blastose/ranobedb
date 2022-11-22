<script lang="ts">
	import '../app.css';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { theme } from '$lib/stores/theme';
	import Layout from '$lib/components/layout/Layout.svelte';

	$: {
		if (browser) {
			if ($theme === 'dark') {
				document.documentElement.classList.add('dark');
			} else if ($theme === 'light') {
				document.documentElement.classList.remove('dark');
			}
		}
	}

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

<Layout>
	<slot />
</Layout>
