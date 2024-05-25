import { browser } from '$app/environment';
import type { Nullish } from '$lib/server/zod/schema';
import { getContext } from 'svelte';
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
	document.cookie = `theme=${newTheme}; path=/; max-age=1704085200`; // 10 years; 1704085200 is one year
}

export function createThemeStore() {
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

export function getThemeContext() {
	return getContext<ReturnType<typeof createThemeStore>>('theme');
}

export function getBgImageStyle(theme: Theme, imageUrl: Nullish<string>) {
	if (!imageUrl) {
		return '';
	}

	if (theme === 'light') {
		return `background-image: linear-gradient(rgba(242, 242, 242, 0.25) 0%, rgba(242, 242, 242, 1) 75%, rgba(242, 242, 242, 1) 100%), url(${imageUrl});`;
	} else {
		return `background-image: linear-gradient(rgba(34, 34, 34, 0.5) 0%, rgba(34, 34, 34, 1) 90%, rgba(34, 34, 34, 1) 100%), url(${imageUrl});`;
	}
}
