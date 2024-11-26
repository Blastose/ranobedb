import { getContext } from 'svelte';
import { writable } from 'svelte/store';

export function createRelCalStore() {
	return writable<'compact' | 'grid'>('compact');
}

export function getRelCalStoreContext() {
	return getContext<ReturnType<typeof createRelCalStore>>('relCal');
}
