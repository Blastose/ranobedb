import { writable, type Writable } from 'svelte/store';

const largeScreen: Writable<boolean> = writable(true);

export default largeScreen;
