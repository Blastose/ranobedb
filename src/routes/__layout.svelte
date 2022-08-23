<script lang="ts">
	import '../app.css';
	import Header from '$lib/header/Header.svelte';
	import Sidebar from '$lib/sidebar/Sidebar.svelte';
	import { session } from '$app/stores';
	import { supabaseClient } from '$lib/db';
	import { SupaAuthHelper } from '@supabase/auth-helpers-svelte';

	import Modal from 'svelte-simple-modal';
	import { modal } from '$lib/stores/modalStore';
	import { onMount } from 'svelte';

	onMount(() => {
		if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
			document.documentElement.classList.add('dark');
		}
	});
</script>

<svelte:head>
	<script>
		if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
			document.documentElement.classList.add('dark');
		}
	</script>
	<title>Light Novel DB</title>
</svelte:head>

<SupaAuthHelper {supabaseClient} {session} autoRefreshToken={true}>
	<div class="flex">
		<!-- The background color for the modal is hard coded here -->
		<!-- Need's to be changed so it works with both light and dark mode -->
		<Modal show={$modal} styleWindow={{ backgroundColor: '#212224' }} />
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
