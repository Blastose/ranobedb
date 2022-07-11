<script lang="ts">
	import { sidebarOpen } from '$lib/sidebarStore';

	let toggleSidebar = () => {
		sidebarOpen.update((status) => !status);
	};
</script>

<header class="sticky top-0 bg-[#fafafa] drop-shadow-sm">
	<div class="container px-8 py-2 mx-auto duration-150">
		{#if !$sidebarOpen}
			<button on:click={toggleSidebar}><span class="text-2xl">=</span></button>
		{/if}
		<span class="text-2xl font-bold">Header</span>
	</div>
</header>
