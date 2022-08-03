import type { SvelteComponent } from 'svelte';
import { writable } from 'svelte/store';

export const modalComponent = writable<typeof SvelteComponent>(null);
