import { getContext } from 'svelte';
import { writable } from 'svelte/store';

function createSidebarStore() {
	return writable<'open' | 'closed'>('open');
}

export function getSidebarStoreContext() {
	return getContext<ReturnType<typeof createSidebarStore>>('sidebar');
}
