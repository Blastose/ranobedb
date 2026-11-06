interface ScrollSpyOptions {
	/** Heading ids to follow, in document order. */
	ids: string[];
	/** Height of everything pinned above the content (app header, sticky bars), in px. */
	getOffset: () => number;
	onChange: (id: string | undefined) => void;
}

/**
 * Reports the last heading that has scrolled under the pinned UI.
 * Call from an `$effect` and return the result so listeners are removed on teardown.
 */
export function scrollSpy({ ids, getOffset, onChange }: ScrollSpyOptions) {
	const headings = ids
		.map((id) => document.getElementById(id))
		.filter((el): el is HTMLElement => !!el);
	const threshold = () => getOffset() + 32;
	const hashId = () => decodeURIComponent(location.hash.slice(1));

	const update = () => {
		let current = headings[0];
		for (const heading of headings) {
			if (heading.getBoundingClientRect().top > threshold()) break;
			current = heading;
		}
		onChange(current?.id);
	};

	const startHash = hashId();
	if (ids.includes(startHash)) onChange(startHash);
	else update();

	// The first callback reports the starting layout, before the browser has scrolled to a hash.
	let initial = true;
	const observer = new IntersectionObserver(
		() => {
			const skip = initial && ids.includes(startHash);
			initial = false;
			if (!skip) update();
		},
		{ rootMargin: `-${threshold() - 8}px 0px -70% 0px` },
	);
	headings.forEach((heading) => observer.observe(heading));

	const onHashChange = () => {
		if (ids.includes(hashId())) onChange(hashId());
	};
	window.addEventListener('hashchange', onHashChange);

	return () => {
		observer.disconnect();
		window.removeEventListener('hashchange', onHashChange);
	};
}

/**
 * Marks a scroll container with `has-more` while content remains below its visible area, so CSS
 * can fade the cut-off edge. Every item stays reachable; this only changes how the edge looks.
 */
export function scrollFade(node: HTMLElement) {
	const update = () => {
		node.classList.toggle('has-more', node.scrollTop + node.clientHeight < node.scrollHeight - 1);
	};
	update();
	node.addEventListener('scroll', update, { passive: true });
	const observer = new ResizeObserver(update);
	observer.observe(node);
	if (node.firstElementChild) observer.observe(node.firstElementChild);
	return {
		destroy() {
			node.removeEventListener('scroll', update);
			observer.disconnect();
		},
	};
}
