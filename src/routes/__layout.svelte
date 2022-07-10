<script lang="ts">
	import '../app.css';
	import Header from '$lib/header/Header.svelte';
	import Sidebar from '$lib/sidebar/Sidebar.svelte';

	let width: number = 1000;

	let sidebarShow = true;
	function toggleSidebar() {
		sidebarShow = !sidebarShow;
	}
</script>

<svelte:head><title>Light Novel DB</title></svelte:head>
<svelte:window bind:innerWidth={width} />

<!-- Need to put h-screen into conditional since it messes up the layout for some reason -->
<div class="flex {width >= 1000 ? '' : 'h-screen'}">
	<Sidebar {sidebarShow} {toggleSidebar} />

	<div class="flex-grow bg-[#fafafa]">
		<Header {sidebarShow} {toggleSidebar} />

		<main class="container mx-auto px-8 py-2 duration-150">
			<slot />
		</main>
	</div>
</div>
