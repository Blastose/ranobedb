export function getPaginationFromUrl(url: URL) {
	let limit = Number(url.searchParams.get('limit') ?? '24');
	let page = Number(url.searchParams.get('page') ?? '1');
	if (page < 1) {
		page = 1;
	}

	if (limit > 100) {
		limit = 100;
	} else if (limit < 1) {
		limit = 1;
	}

	return {
		limit,
		page
	};
}
