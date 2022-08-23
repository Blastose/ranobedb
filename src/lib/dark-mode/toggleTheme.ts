import type { Writable } from 'svelte/store';
import { get } from 'svelte/store';

export function toggleTheme(theme: Writable<string>): void {
	const themeType = get(theme);
	let newTheme: string;

	if (themeType === 'dark') {
		newTheme = 'light';
	} else if (themeType === 'light') {
		newTheme = 'dark';
	}

	theme.set(newTheme);
	localStorage.setItem('theme', newTheme);
}
