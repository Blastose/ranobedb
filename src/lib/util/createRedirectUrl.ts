export function createRedirectUrl(baseUrl: string, url: URL) {
	return `/${baseUrl}?redirect=${url.pathname}${url.search}`;
}
