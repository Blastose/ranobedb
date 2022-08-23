<script lang="ts">
	import { theme } from '$lib/stores/themeStore';
	import { toggleTheme } from '$lib/dark-mode/toggleTheme';
	import Icon from '$lib/components/Icon.svelte';
</script>

<button
	on:click={() => {
		toggleTheme(theme);
	}}
	class={$theme === 'dark' ? 'text-white' : ''}
>
	{#if $theme === 'dark'}
		<Icon height="24" width="24" name="sun" />
	{:else}
		<Icon height="24" width="24" name="moon" />
	{/if}
</button>
