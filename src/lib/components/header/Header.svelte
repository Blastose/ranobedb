<script lang="ts">
	import sidebar from '$lib/stores/sidebar';
	import { theme, toggleTheme } from '$lib/stores/theme';
</script>

<header class="header border-b border-[#4b4b4b15] dark:border-[#ffffff1a]">
	<div class="flex justify-between gap-2 px-8 py-2 mx-auto duration-150 max-w-7xl">
		<p class="text-2xl font-bold">RanobeDB</p>
		<div>
			<button
				class="px-2 rounded-md bg-sky-300 dark:bg-slate-500"
				on:click={() => {
					sidebar.set(!$sidebar);
				}}
				>sidebar
			</button>
			<button
				class="px-2 rounded-md bg-sky-300 dark:bg-slate-500"
				on:click={() => {
					toggleTheme();
				}}
			>
				theme
			</button>
		</div>
	</div>
</header>

<style>
	.header {
		background-color: var(--primary-50);
	}

	:global(.dark .header) {
		background-color: var(--dark-700);
	}
</style>
