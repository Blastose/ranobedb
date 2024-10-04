import { redirect } from '@sveltejs/kit';

export const load = async ({ params }) => {
	const userIdNumeric = Number(params.id);

	// TODO Let user set default list
	redirect(303, `/user/${userIdNumeric}/list/books`);
};
