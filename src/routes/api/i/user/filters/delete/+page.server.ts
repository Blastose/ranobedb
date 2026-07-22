import { db } from '$lib/server/db/db';
import { fail } from '@sveltejs/kit';
import { z } from 'zod/v4';
import { dbItemArray } from '$lib/db/dbConsts';

const deleteSchema = z.object({
	target: z.enum(dbItemArray),
	is_list: z.boolean(),
	name: z.string().max(100),
});

export const actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401);
		}

		const formData = await request.formData();
		const data = {
			target: formData.get('target'),
			is_list: formData.get('is_list') === 'true',
			name: formData.get('name'),
		};

		const parsed = deleteSchema.safeParse(data);
		if (!parsed.success) {
			return fail(400);
		}

		await db
			.deleteFrom('saved_filter')
			.where('user_id', '=', locals.user.id)
			.where('item_name', '=', parsed.data.target)
			.where('is_list', '=', parsed.data.is_list)
			.where('name', '=', parsed.data.name)
			.execute();

		return { success: true };
	},
};
