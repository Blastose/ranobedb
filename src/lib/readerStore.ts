import { writable, type Writable } from 'svelte/store';
import type Reader from './models/reader';

export const reader: Writable<Reader | null> = writable(null);
