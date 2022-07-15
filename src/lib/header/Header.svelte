<script lang="ts">
	import { sidebarOpen } from '$lib/stores/sidebarStore';
	import ProfileCircle from './ProfileCircle.svelte';
	import { reader } from '$lib/stores/readerStore';
	import MenuIcon from '$lib/svg/MenuIcon.svelte';

	const toggleSidebar = () => {
		sidebarOpen.update((status) => !status);
	};
</script>

<header class="sticky top-0 bg-[#fafafa] drop-shadow-sm">
	<div class="container px-8 py-2 mx-auto duration-150">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-2">
				{#if !$sidebarOpen}
					<button
						class="hover:bg-[#cdcedd] self-end rounded-lg p-1 duration-75"
						on:click={toggleSidebar}
					>
						<span class="text-2xl"><MenuIcon /></span>
					</button>
				{/if}
				<span class="text-2xl font-bold">Light Novel DB</span>
			</div>
			<ProfileCircle />
		</div>
	</div>
</header>
