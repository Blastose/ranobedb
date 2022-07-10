<script>
	import '../app.css';
	import Header from '$lib/header/Header.svelte';
	import Sidebar from '$lib/sidebar/Sidebar.svelte';

	let sidebarShow = true;
	function toggleSidebar() {
		sidebarShow = !sidebarShow;
	}
</script>

<svelte:head><title>Light Novel DB</title></svelte:head>

<div class="flex">
	<Sidebar {sidebarShow} {toggleSidebar} />

	<div class="flex-grow bg-[#fafafa]">
		<Header {sidebarShow} {toggleSidebar} />

		<main class="container mx-auto px-8 py-2 duration-150">
			<slot />
		</main>
	</div>
</div>
