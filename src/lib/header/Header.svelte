<script lang="ts">
	import { sidebarOpen } from '$lib/stores/sidebarStore';
	import ProfileCircle from './ProfileCircle.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import ThemeToggle from './ThemeToggle.svelte';
	import { windowWidth } from '$lib/stores/windowWidthStore';

	const toggleSidebar = () => {
		sidebarOpen.update((status) => !status);
	};
</script>

<header class="sticky z-10 top-0 bg-[#fafafa] dark:bg-[#212224] drop-shadow-sm">
	<div class="container px-8 py-2 mx-auto duration-150">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-2">
				{#if !$sidebarOpen}
					<button
						class="hover:bg-[#cdcedd] dark:text-white dark:hover:text-black self-end rounded-lg p-1 duration-75"
						on:click={toggleSidebar}
					>
						<span class="text-2xl">
							<Icon name="menu" width="24" height="24" />
						</span>
					</button>
				{/if}
				<span class="text-2xl font-bold dark:text-white ">
					{#if $windowWidth > 400}
						Light Novel DB
					{:else}
						LNDB
					{/if}
				</span>
			</div>
			<div class="flex gap-4">
				<ThemeToggle />
				<ProfileCircle />
			</div>
		</div>
	</div>
</header>
