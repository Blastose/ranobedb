export function debounce(func: () => Promise<void>, delay: number) {
	let timeout: ReturnType<typeof setTimeout>;
	return () => {
		clearTimeout(timeout);
		timeout = setTimeout(async () => {
			await func();
		}, delay);
	};
}
