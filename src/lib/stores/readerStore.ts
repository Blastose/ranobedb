import { writable, type Writable } from 'svelte/store';
import type Reader from '$lib/models/reader';

export const reader: Writable<Reader | null> = writable(null);
