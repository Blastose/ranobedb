import { getContext } from 'svelte';

export function getTodayContext() {
	return getContext<number>('today');
}
