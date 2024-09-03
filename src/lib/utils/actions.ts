import type { Action } from 'svelte/action';

export const clickOutside: Action<Node, Node | undefined, { 'on:outclick': () => void }> = (
	node: Node,
	toggleButton?: Node,
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
		},
	};
};
