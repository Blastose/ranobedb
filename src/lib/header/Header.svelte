<script lang="ts">
	import { sidebarOpen } from '$lib/sidebarStore';
	import { user } from '$lib/sessionStore';
	import { reader } from '$lib/readerStore';

	const toggleSidebar = () => {
		sidebarOpen.update((status) => !status);
	};
</script>

<header class="sticky top-0 bg-[#fafafa] drop-shadow-sm">
	<div class="container px-8 py-2 mx-auto duration-150">
		<div class="flex items-center justify-between">
			<div>
				{#if !$sidebarOpen}
					<button on:click={toggleSidebar}><span class="text-2xl">=</span></button>
				{/if}
				<span class="text-2xl font-bold">Header</span>
			</div>
			{#if $reader}
				<span>{$reader.reader_name}</span>
			{/if}
		</div>
	</div>
</header>
