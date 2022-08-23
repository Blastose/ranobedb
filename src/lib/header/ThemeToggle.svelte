<script lang="ts">
	import { theme } from '$lib/stores/themeStore';
	import { toggleTheme } from '$lib/dark-mode/toggleTheme';
</script>

<button
	on:click={() => {
		toggleTheme(theme);
	}}
	class="bg-slate-400 rounded-full p-4"
>
	<span class="text-white">Click</span>
</button>
