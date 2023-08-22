import type { Action } from 'svelte/action';

export const clickOutside: Action<HTMLDivElement, Node | null, { 'on:outclick': () => void }> = (
	node,
	toggleButton
) => {
	const handleClick = (event: Event) => {
		if (!node.contains(event.target as Node) && !toggleButton?.contains(event.target as Node)) {
			node.dispatchEvent(new CustomEvent('outclick'));
		}
	};
	document.addEventListener('click', handleClick, true);

	return {
		destroy() {
			document.removeEventListener('click', handleClick, true);
		}
	};
};
