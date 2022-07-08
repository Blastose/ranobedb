<script>
	import '../app.css';
	import Header from '$lib/header/Header.svelte';
	import Sidebar from '$lib/sidebar/Sidebar.svelte';
</script>

<div class="flex">
	<Sidebar />

	<div class="flex-grow bg-slate-100">
		<Header />

		<main>
			<slot />
		</main>
	</div>
</div>
