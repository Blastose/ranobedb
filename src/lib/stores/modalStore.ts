import type { SvelteComponent } from 'svelte';
import { writable } from 'svelte/store';

export const modal = writable<typeof SvelteComponent>(null);
