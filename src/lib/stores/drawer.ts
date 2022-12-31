import { writable, type Writable } from 'svelte/store';

const drawer: Writable<boolean> = writable(false);

export default drawer;
