export function getMode() {
	return import.meta.env.MODE as 'development' | 'production' | 'testing';
}
