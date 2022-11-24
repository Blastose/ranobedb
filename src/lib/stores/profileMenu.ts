import { writable, type Writable } from 'svelte/store';

const profileMenu: Writable<boolean> = writable(false);

export default profileMenu;
