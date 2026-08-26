<script lang="ts">
	import { getThemeContext, themes, type Theme } from '$lib/stores/themeStore.js';

	const currentTheme = getThemeContext();
	function handleThemeChange(e: Event & { currentTarget: EventTarget & HTMLSelectElement }) {
		currentTheme.set(e.currentTarget.value as Theme);
	}
</script>

<label class="flex items-center gap-2">
	<span>Theme</span>
	<select onchange={handleThemeChange} class="input reset-padding capitalize" name="theme">
		{#each themes as theme}
			<option value={theme} selected={theme === $currentTheme}>{theme}</option>
		{/each}
	</select>
</label>
