import { writable, type Writable } from 'svelte/store';
import View from '$lib/models/view';

export const booksView: Writable<View> = writable(View.card);
