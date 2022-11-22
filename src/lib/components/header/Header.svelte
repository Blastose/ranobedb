<script lang="ts">
	import sidebar from '$lib/stores/sidebar';
	import { theme, toggleTheme } from '$lib/stores/theme';
</script>

<header>
	<div class="flex gap-2 max-w-7xl px-8 py-2 mx-auto duration-150">
		<button
			class="rounded-md px-2 bg-sky-300"
			on:click={() => {
				sidebar.set(!$sidebar);
			}}
			>click
		</button>
		<button
			class="rounded-md px-2 bg-sky-300"
			on:click={() => {
				toggleTheme();
			}}
		>
			theme
		</button>
		<p>RanobeDB</p>
	</div>
</header>
