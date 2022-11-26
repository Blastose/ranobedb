import { writable, type Writable } from 'svelte/store';

const focusSidebar: Writable<boolean> = writable(false);

export default focusSidebar;
