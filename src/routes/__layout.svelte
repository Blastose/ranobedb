<script>
	import '../app.css';
	import Header from '$lib/header/Header.svelte';
	import Sidebar from '$lib/sidebar/Sidebar.svelte';
</script>

<div class="flex">
	<Sidebar />

	<div class="flex-grow bg-[#fafafa]">
		<Header />

		<main class="px-6 py-2">
			<slot />
		</main>
	</div>
</div>
