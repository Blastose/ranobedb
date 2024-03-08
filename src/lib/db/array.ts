export function arrayDiff<T extends { id: number }>(a: T[], b: T[]) {
	return a.filter((item1) => !b.some((item2) => item2.id === item1.id));
}

export function arrayIntersection<T extends { id: number }>(a: T[], b: T[]) {
	return a.filter((item1) => b.some((item2) => item2.id === item1.id));
}
