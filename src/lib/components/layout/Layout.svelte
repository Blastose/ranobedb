<script lang="ts">
	import BottomNav from './BottomNav.svelte';
	import Header from './Header.svelte';
	import Sidebar from './Sidebar.svelte';
</script>

<div class="grid grid-cols-[min-content_1fr] min-h-full">
	<div class="invisible w-64 -ml-64 lg:visible sidebar-animation lg:ml-0">
		<Sidebar />
	</div>

	<div class="flex flex-col min-h-full">
		<Header />

		<div class="flex-grow overflow-x-clip">
			<slot />
		</div>

		<BottomNav />
	</div>
</div>

<style>
	.sidebar-animation {
		transition-duration: 0.45s;
		transition-timing-function: cubic-bezier(0.17, 0.67, 0.23, 1.02);
	}
</style>
