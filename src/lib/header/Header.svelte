<script lang="ts">
	import { sidebarOpen } from '$lib/stores/sidebarStore';
	import ProfileCircle from './ProfileCircle.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import ThemeToggle from './ThemeToggle.svelte';

	const toggleSidebar = () => {
		sidebarOpen.update((status) => !status);
	};
</script>

<header class="sticky z-10 top-0 bg-primary-50 dark:bg-dark-700 drop-shadow-sm">
	<div class="container px-8 py-2 mx-auto duration-150">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-2">
				{#if !$sidebarOpen}
					<button
						class="hover:bg-primary-300 dark:text-white dark:hover:text-black self-end rounded-lg p-1 duration-75"
						on:click={toggleSidebar}
					>
						<span class="text-2xl">
							<Icon name="menu" width="24" height="24" />
						</span>
					</button>
				{/if}
				<span class="text-2xl font-bold dark:text-white full">RanobeDB</span>
				<span class="text-2xl font-bold dark:text-white short">RNDB</span>
			</div>
			<div class="flex gap-4">
				<ThemeToggle />
				<ProfileCircle />
			</div>
		</div>
	</div>
</header>

<style>
	span.short {
		display: inline-block;
	}
	span.full {
		display: none;
	}
	@media (min-width: 420px) {
		span.short {
			display: none;
		}
		span.full {
			display: inline-block;
		}
	}
</style>
