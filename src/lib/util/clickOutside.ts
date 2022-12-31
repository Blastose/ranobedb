export function clickOutside(node: Node, toggleButton: Node | null) {
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
}
