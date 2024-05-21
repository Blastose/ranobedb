export function buildRedirectUrl(currentUrl: URL, nextPathname: string) {
	return `${nextPathname}?redirect=${currentUrl.pathname}`;
}

export function buildUrlFromRedirect(currentUrl: URL, redirect: string) {
	const newUrl = new URL(currentUrl.origin);
	newUrl.pathname = redirect;
	return newUrl.toString();
}
