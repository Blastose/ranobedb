export function arrayDiff<T extends { id: number }>(a: T[], b: T[]) {
	return a.filter((item1) => !b.some((item2) => item2.id === item1.id));
}

export function arrayIntersection<T extends { id: number }>(a: T[], b: T[]) {
	return a.filter((item1) => b.some((item2) => item2.id === item1.id));
}

// From https://github.com/jimmywarting/groupby-polyfill/blob/main/lib/polyfill.js
export function groupBy<T, K extends string | number | symbol>(
	iterable: Iterable<T>,
	callbackfn: (arg0: T, arg1: number) => K
): { [s: string]: T[] } {
	const obj = Object.assign({});
	let i = 0;
	for (const value of iterable) {
		const key = callbackfn(value, i++);
		key in obj ? obj[key].push(value) : (obj[key] = [value]);
	}
	return obj;
}
