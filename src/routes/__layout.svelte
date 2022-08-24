<script lang="ts">
	import '../app.css';
	import Header from '$lib/header/Header.svelte';
	import Sidebar from '$lib/sidebar/Sidebar.svelte';
	import { session } from '$app/stores';
	import { supabaseClient } from '$lib/db';
	import { SupaAuthHelper } from '@supabase/auth-helpers-svelte';
	import { theme } from '$lib/stores/themeStore';
	import Modal from 'svelte-simple-modal';
	import { modal } from '$lib/stores/modalStore';
	import ModalCloseButton from '$lib/components/ModalCloseButton.svelte';
	import { browser } from '$app/env';
	import { onMount } from 'svelte';

	$: {
		if (browser) {
			if ($theme === 'dark') {
				document.documentElement.classList.add('dark');
				document.documentElement.classList.add('_dark');
			} else if ($theme === 'light') {
				document.documentElement.classList.remove('dark');
				document.documentElement.classList.remove('_dark');
			}
		}
	}

	onMount(() => {
		if (!('theme' in localStorage)) {
			if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
				document.documentElement.classList.add('dark');
				document.documentElement.classList.add('_dark');
				theme.set('dark');
			} else {
				theme.set('light');
			}
		} else {
			if (localStorage.getItem('theme') === 'dark') {
				document.documentElement.classList.add('dark');
				document.documentElement.classList.add('_dark');
				theme.set('dark');
			} else if (localStorage.getItem('theme') === 'light') {
				theme.set('light');
			}
		}
	});
</script>

<svelte:head>
	<script>
		// No functionality for ssr dark mode without js yet
		// Same as above but needed to prevent flashing of white since this blocks
		if (!('theme' in localStorage)) {
			if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
				document.documentElement.classList.add('dark');
				document.documentElement.classList.add('_dark');
			}
		} else {
			if (localStorage.getItem('theme') === 'dark') {
				document.documentElement.classList.add('dark');
				document.documentElement.classList.add('_dark');
			}
		}
	</script>
</svelte:head>

<SupaAuthHelper {supabaseClient} {session} autoRefreshToken={true}>
	<div class="flex">
		<Modal
			show={$modal}
			unstyled={true}
			classBg="fixed z-[1000] top-0 left-0 flex flex-col justify-center w-screen h-screen bg-black/[.66]"
			classWindowWrap="relative m-8 max-h-full"
			classWindow="relative w-[40rem] max-w-full max-h-full my-8 mx-auto text-black rounded-md bg-white dark:bg-[#212224]"
			classContent="relative p-4 max-h-[calc(100vh_-_4rem)] overflow-auto"
			closeButton={ModalCloseButton}
		/>
		<Sidebar />

		<!-- Hack to make screen full on smaller widths -->
		<!-- Normally done on sidebar, but sidebar is removed from flow on small screens -->
		<div class="h-screen lg:hidden" />

		<div class="flex flex-col flex-grow bg-[#fafafa] dark:bg-[#212224]">
			<Header />

			<div class="flex-grow">
				<slot />
			</div>
		</div>
	</div>
</SupaAuthHelper>
