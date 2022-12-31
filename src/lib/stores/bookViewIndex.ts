import { writable, type Writable } from 'svelte/store';

const bookViewIndex: Writable<number> = writable(1);

export default bookViewIndex;
