import imageSize from 'image-size';
import sharp from 'sharp';
import type { Transaction } from 'kysely';
import { fail, message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { db } from '$lib/server/db/db.js';
import type { DB } from '$lib/server/db/dbTypes';
import {
	generateNanoid,
	removeProfileImagesFromUser,
	saveProfileImageToR2,
} from '$lib/server/db/images/upload.js';
import { profilePictureSchema, removeProfilePictureSchema } from '$lib/server/zod/schema.js';
import type { RequestEvent } from '../$types';

async function removeCurrentProfileImage(trx: Transaction<DB>, userId: string) {
	const user_profile_image_id = await trx
		.selectFrom('auth_user')
		.leftJoin('profile_image', 'profile_image.id', 'auth_user.profile_image_id')
		.select(['auth_user.profile_image_id', 'profile_image.filename'])
		.where('auth_user.id', '=', userId)
		.executeTakeFirstOrThrow();
	if (!user_profile_image_id.profile_image_id) {
		return;
	}
	await trx
		.updateTable('auth_user')
		.set({ profile_image_id: null })
		.where('auth_user.id', '=', userId)
		.execute();
	await trx
		.deleteFrom('profile_image')
		.where('profile_image.id', '=', user_profile_image_id.profile_image_id)
		.execute();
	if (user_profile_image_id.filename) {
		await removeProfileImagesFromUser(user_profile_image_id.filename);
	}
}

export const profilepicture = async (event: RequestEvent) => {
	const { locals, request } = event;
	const user = locals.user;
	if (!user) {
		return fail(401);
	}

	const formData = await request.formData();

	const profilePictureForm = await superValidate(formData, zod4(profilePictureSchema));

	if (!profilePictureForm.valid) {
		return message(
			profilePictureForm,
			{ type: 'error', text: 'Image is too large.' },
			{ status: 400 },
		);
	}

	const image = profilePictureForm.data.image;

	const img_buff = new Uint8Array(await image?.arrayBuffer());
	let { height, width } = imageSize(img_buff);
	if (!height || !width || height > 50000 || width > 50000) {
		return message(
			profilePictureForm,
			{ type: 'error', text: 'Invalid image dimensions.' },
			{ status: 400 },
		);
	}
	const resized_img_buff = await sharp(img_buff).resize(220).jpeg({ mozjpeg: true }).toBuffer();
	({ height, width } = imageSize(resized_img_buff));
	if (!height || !width || height > 500) {
		return message(
			profilePictureForm,
			{ type: 'error', text: 'Invalid image dimensions.' },
			{ status: 400 },
		);
	}

	await db.transaction().execute(async (trx) => {
		await removeCurrentProfileImage(trx, user.id);

		const inserted_image = await trx
			.insertInto('profile_image')
			.values({
				filename: generateNanoid() + '.jpg',
				height: height,
				spoiler: true,
				width: width,
			})
			.returning(['profile_image.id', 'profile_image.filename'])
			.executeTakeFirstOrThrow();
		await trx
			.updateTable('auth_user')
			.set({ profile_image_id: inserted_image.id })
			.where('auth_user.id', '=', user.id)
			.execute();
		await saveProfileImageToR2(inserted_image.filename, resized_img_buff);
	});

	return message(profilePictureForm, {
		text: 'Uploaded profile picture successfully!',
		type: 'success',
	});
};

export const removeprofilepicture = async (event: RequestEvent) => {
	const { locals, request } = event;
	const user = locals.user;
	if (!user) {
		return fail(401);
	}
	const formData = await request.formData();
	const removeProfilePictureForm = await superValidate(formData, zod4(removeProfilePictureSchema));

	await db.transaction().execute(async (trx) => {
		await removeCurrentProfileImage(trx, user.id);
	});

	return message(removeProfilePictureForm, {
		text: 'Removed profile picture successfully!',
		type: 'success',
	});
};
