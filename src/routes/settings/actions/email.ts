import { ORIGIN } from '$env/static/private';
import { fail, message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { db } from '$lib/server/db/db.js';
import { DBUsers } from '$lib/server/db/user/user.js';
import { EmailVerification } from '$lib/server/email/email.js';
import { getMode } from '$lib/mode/mode.js';
import {
	changeEmailLimiter,
	isLimited,
	sendVerificationCodelimiter,
	verifyCodeLimiter,
} from '$lib/server/rate-limiter/rate-limiter.js';
import { verifyPasswordHash } from '$lib/server/password/hash.js';
import { validateTurnstile } from '$lib/server/cf.js';
import {
	changeEmailSchema,
	sendEmailVerificationSchema,
	verifyEmailSchema,
} from '$lib/server/zod/schema.js';
import type { RequestEvent } from '../$types';

export const sendemailverificationcode = async (event: RequestEvent) => {
	const { request, locals } = event;
	if (!locals.user) return fail(401);

	const formData = await request.formData();

	const form = await superValidate(formData, zod4(sendEmailVerificationSchema));
	if (!form.valid) {
		return message(form, { type: 'error', text: 'Error' }, { status: 400 });
	}

	const turnstileSuccess = await validateTurnstile({ request, body: formData });
	if (!turnstileSuccess) {
		return fail(400);
	}

	const dbUsers = new DBUsers(db);
	const user = await dbUsers.getUserFull(locals.user.username);

	if (!user) {
		return fail(401);
	}

	if (user.email_verified) {
		return fail(401);
	}

	const validPassword = await verifyPasswordHash(user.hashed_password, form.data.password);
	if (!validPassword) {
		return message(form, { type: 'error', text: 'Invalid password' }, { status: 400 });
	}

	if (await isLimited(sendVerificationCodelimiter, event)) {
		return message(
			form,
			{ type: 'error', text: 'Too many email code attempts; Try again later' },
			{ status: 429 },
		);
	}

	const emailVerification = new EmailVerification(db);
	const code = await emailVerification.generateEmailVerificationCode(locals.user.id, user.email);
	await emailVerification.sendVerificationCodeEmail({
		email: user.email,
		verificationCode: code,
		username: user.username,
	});

	return message(form, {
		text: 'Sent a verification code to your email address!',
		type: 'success',
	});
};

export const verifyemail = async (event: RequestEvent) => {
	const { request, locals } = event;
	if (!locals.user) {
		return fail(401);
	}

	const verifyEmailForm = await superValidate(request, zod4(verifyEmailSchema));
	if (!verifyEmailForm.valid) {
		return message(verifyEmailForm, { type: 'error', text: 'Error' }, { status: 400 });
	}

	if (await isLimited(verifyCodeLimiter, event)) {
		return message(
			verifyEmailForm,
			{ type: 'error', text: 'Too many verify code attempts; Try again later' },
			{ status: 429 },
		);
	}

	const emailVerification = new EmailVerification(db);

	const validCode = await emailVerification.verifyVerificationCode(
		locals.user,
		verifyEmailForm.data.code,
	);
	if (!validCode) {
		return message(verifyEmailForm, { text: 'Invalid code!', type: 'error' }, { status: 401 });
	}

	await emailVerification.setUserEmailStatusToVerified(locals.user);

	return message(verifyEmailForm, { text: 'Verified email!', type: 'success' });
};

export const changeemail = async (event: RequestEvent) => {
	const { locals, request } = event;
	if (!locals.user) {
		return fail(401);
	}

	const formData = await request.formData();

	const changeEmailForm = await superValidate(formData, zod4(changeEmailSchema));

	const turnstileSuccess = await validateTurnstile({ request, body: formData });
	if (!turnstileSuccess) {
		return fail(400, { changeEmailForm });
	}

	if (!changeEmailForm.valid) {
		return message(changeEmailForm, { type: 'error', text: 'Error' }, { status: 400 });
	}

	const dbUsers = new DBUsers(db);

	const user = await dbUsers.getUserFull(locals.user.username);

	if (!user) {
		return message(changeEmailForm, { type: 'error', text: 'Error' }, { status: 400 });
	}

	if (user.email === changeEmailForm.data.new_email) {
		return message(
			changeEmailForm,
			{ type: 'error', text: 'New email cannot be the same as current email' },
			{ status: 400 },
		);
	}

	const validPassword = await verifyPasswordHash(
		user.hashed_password,
		changeEmailForm.data.password,
	);
	if (!validPassword) {
		return message(
			changeEmailForm,
			{ type: 'error', text: 'Invalid credentials!' },
			{ status: 400 },
		);
	}

	if (user.email !== changeEmailForm.data.current_email) {
		return message(
			changeEmailForm,
			{ type: 'error', text: 'Invalid credentials!' },
			{ status: 400 },
		);
	}

	if (await isLimited(changeEmailLimiter, event)) {
		return message(
			changeEmailForm,
			{ type: 'error', text: 'Too many change email attempts; Try again later' },
			{ status: 429 },
		);
	}

	const emailVerification = new EmailVerification(db);
	const verificationToken = await emailVerification.createEmailVerificationToken(
		user.user_id,
		changeEmailForm.data.new_email,
	);
	const verificationLink = ORIGIN + '/email-verification?token=' + verificationToken;

	if (getMode() !== 'production') {
		console.log(verificationLink);
	} else {
		await emailVerification.sendVerificationTokenUrlEmail({
			email: changeEmailForm.data.new_email,
			username: user.username,
			verificationTokenUrl: verificationLink,
		});
	}

	return message(changeEmailForm, {
		text: 'Sent an email to new email address!',
		type: 'success',
	});
};
