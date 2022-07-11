<script lang="ts">
	import '../app.css';
	import Header from '$lib/header/Header.svelte';
	import Sidebar from '$lib/sidebar/Sidebar.svelte';
	import { windowWidth } from '$lib/windowWidthStore';
	import { onMount } from 'svelte';
	import { sidebarOpen } from '$lib/sidebarStore';

	let initialLoad = true;

	onMount(() => {
		if ($windowWidth <= 1000) {
			sidebarOpen.set(false);
		}
		initialLoad = false;
	});
</script>

<svelte:head><title>Light Novel DB</title></svelte:head>
<svelte:window bind:innerWidth={$windowWidth} />

{#if initialLoad}
	<div class="flex bg-[#fafafa]" />
{:else}
	<!-- Need to put h-screen into conditional since it messes up the layout for some reason -->
	<div class="flex {$windowWidth <= 1000 ? 'h-screen' : ''}">
		<Sidebar />

		<div class="flex-grow bg-[#fafafa]">
			<Header />

			<main class="container mx-auto px-8 py-2 duration-150">
				<slot />
			</main>
		</div>
	</div>
{/if}
