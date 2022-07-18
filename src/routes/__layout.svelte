<script lang="ts">
	import '../app.css';
	import Header from '$lib/header/Header.svelte';
	import Sidebar from '$lib/sidebar/Sidebar.svelte';
	import { windowWidth } from '$lib/stores/windowWidthStore';
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabaseClient';
	import { sidebarOpen } from '$lib/stores/sidebarStore';
	import { user } from '$lib/stores/sessionStore';
	import { reader } from '$lib/stores/readerStore';
	import { navigating } from '$app/stores';
	import LoadingIcon from '$lib/svg/LoadingIcon.svelte';

	let initialLoad = true;

	supabase.auth.onAuthStateChange(async (_, session) => {
		if (session) {
			user.set(session.user);
			reader.set(await getReader(session.user!.id));
		} else {
			user.set(null);
			reader.set(null);
		}
	});

	const getReader = async (id: string) => {
		try {
			let { data, error, status } = await supabase
				.from('reader')
				.select('*')
				.eq('auth_id', id)
				.single();
			if (error) throw error;
			return data;
		} catch (error: any) {
			console.error(error);
			return null;
		}
	};

	onMount(async () => {
		if ($windowWidth <= 1000) {
			sidebarOpen.set(false);
		}
		user.set(supabase.auth.user());
		if ($user) {
			reader.set(await getReader($user!.id));
		}
		initialLoad = false;
	});
</script>

<svelte:head><title>Light Novel DB</title></svelte:head>
<svelte:window bind:innerWidth={$windowWidth} />

{#if initialLoad}
	<div class="flex bg-[#fafafa]" />
{:else}
	<div class="flex">
		<Sidebar />

		<!-- Hack to make screen full on smaller widths -->
		<!-- Normally done on sidebar, but sidebar is removed from flow on small screens -->
		{#if $windowWidth <= 1000}
			<div class="h-screen" />
		{/if}

		<div class="flex flex-col flex-grow bg-[#fafafa]">
			<Header />

			<div class="flex-grow">
				<main class="container mx-auto px-8 py-2 duration-150">
					<!-- {#if !$navigating} -->
					<slot />
					<!-- {:else}
						<div class="flex justify-center py-2"><LoadingIcon /></div>
					{/if} -->
				</main>
			</div>
		</div>
	</div>
{/if}
