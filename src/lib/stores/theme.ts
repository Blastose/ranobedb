import { browser } from '$app/environment';
import { writable, get } from 'svelte/store';

export const theme = writable('dark');

export const toggleTheme = () => {
	let themeType = get(theme);
	if (themeType === 'dark') {
		themeType = 'light';
	} else {
		themeType = 'dark';
	}
	theme.set(themeType);
	localStorage.setItem('theme', themeType);
	if (browser) {
		if (themeType === 'dark') {
			document.documentElement.classList.add('dark');
		} else if (themeType === 'light') {
			document.documentElement.classList.remove('dark');
		}
	}
};
