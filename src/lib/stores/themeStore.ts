import { browser } from '$app/environment';
import { writable } from 'svelte/store';

export type Theme = 'light' | 'dark';

function saveThemeToLocalStorageAndDocument(newTheme: Theme) {
	if (!browser) {
		return;
	}

	if (newTheme === 'dark') {
		document.documentElement.classList.add('dark');
	} else if (newTheme === 'light') {
		document.documentElement.classList.remove('dark');
	}
	localStorage.setItem('theme', newTheme);
	document.cookie = `theme=${newTheme}; path=/; max-age=1704085200`; // 1704085200 is one year
}

function createThemeStore() {
	const { subscribe, set, update } = writable<Theme>(undefined);

	return {
		subscribe,
		set: (newTheme: Theme) => {
			saveThemeToLocalStorageAndDocument(newTheme);
			set(newTheme);
		},
		toggle: () =>
			update((oldTheme) => {
				if (oldTheme === 'dark') {
					saveThemeToLocalStorageAndDocument('light');
					return 'light';
				} else if (oldTheme === 'light') {
					saveThemeToLocalStorageAndDocument('dark');
					return 'dark';
				} else {
					return 'dark';
				}
			}),
	};
}

export const themeStore = createThemeStore();
