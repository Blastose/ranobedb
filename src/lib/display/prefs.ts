import type { DisplayPrefs, Nullish } from '$lib/server/zod/schema';
import { getContext } from 'svelte';
import type { Writable } from 'svelte/store';

export function getDisplayPrefsContext() {
	return getContext<Writable<DisplayPrefs>>('displayPrefs');
}

type ReleaseTitle = {
	title: string;
	romaji?: Nullish<string>;
};
type Name = {
	name: string;
	romaji?: Nullish<string>;
};
export type NameDisplay = ReleaseTitle | Name;
export function getNameDisplay(params: { obj: NameDisplay; prefs: DisplayPrefs['names'] }): string {
	let name;
	if ('name' in params.obj) {
		name = params.obj.name;
	} else {
		name = params.obj.title;
	}
	if (params.prefs === 'romaji') {
		return params.obj.romaji || name;
	} else if (params.prefs === 'native') {
		return name;
	}
	return '';
}
export function getNameDisplaySub(params: {
	obj: NameDisplay;
	prefs: DisplayPrefs['names'];
}): string {
	let name;
	if ('name' in params.obj) {
		name = params.obj.name;
	} else {
		name = params.obj.title;
	}
	if (params.obj.romaji === name) {
		return '';
	}
	if (params.prefs === 'romaji') {
		return name;
	} else if (params.prefs === 'native') {
		return params.obj.romaji ?? '';
	}
	return '';
}
