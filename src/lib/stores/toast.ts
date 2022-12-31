import { writable, type Writable } from 'svelte/store';
import type { IconType } from '$lib/components/icon/Icon.svelte';

type Toast = {
	message: string;
	closeButton: boolean;
	icon?: IconType;
};

const toast: Writable<Toast | null> = writable(null);

export default toast;
