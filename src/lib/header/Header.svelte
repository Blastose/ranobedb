<script lang="ts">
	import { sidebarOpen } from '$lib/stores/sidebarStore';
	import ProfileCircle from './ProfileCircle.svelte';
	import Icon from '$lib/components/Icon.svelte';

	const toggleSidebar = () => {
		sidebarOpen.update((status) => !status);
	};
</script>

<header class="sticky z-10 top-0 bg-[#fafafa] drop-shadow-sm">
	<div class="container px-8 py-2 mx-auto duration-150">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-2">
				{#if !$sidebarOpen}
					<button
						class="hover:bg-[#cdcedd] self-end rounded-lg p-1 duration-75"
						on:click={toggleSidebar}
					>
						<span class="text-2xl"><Icon name="menu" width="24" height="24" /></span>
					</button>
				{/if}
				<span class="text-2xl font-bold">Light Novel DB</span>
			</div>
			<ProfileCircle />
		</div>
	</div>
</header>
