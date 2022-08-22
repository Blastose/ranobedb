<script lang="ts">
	import '../app.css';
	import Header from '$lib/header/Header.svelte';
	import Sidebar from '$lib/sidebar/Sidebar.svelte';
	import { session } from '$app/stores';
	import { supabaseClient } from '$lib/db';
	import { SupaAuthHelper } from '@supabase/auth-helpers-svelte';

	import Modal from 'svelte-simple-modal';
	import { modal } from '$lib/stores/modalStore';
</script>

<svelte:head><title>Light Novel DB</title></svelte:head>

<SupaAuthHelper {supabaseClient} {session} autoRefreshToken={true}>
	<Modal show={$modal} />

	<div class="flex">
		<Sidebar />

		<!-- Hack to make screen full on smaller widths -->
		<!-- Normally done on sidebar, but sidebar is removed from flow on small screens -->
		<div class="h-screen lg:hidden" />

		<div class="flex flex-col flex-grow bg-[#fafafa]">
			<Header />

			<div class="flex-grow">
				<slot />
			</div>
		</div>
	</div>
</SupaAuthHelper>
