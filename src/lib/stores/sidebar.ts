import { writable, type Writable } from 'svelte/store';

const sidebar: Writable<boolean> = writable(true);

export default sidebar;
