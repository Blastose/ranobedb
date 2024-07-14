export async function load({ url }) {
	console.log(url.pathname);
	return { userListBasePath: url.pathname };
}
