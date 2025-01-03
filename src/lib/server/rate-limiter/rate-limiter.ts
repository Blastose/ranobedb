import { getMode } from '$lib/mode/mode';
import type { RequestEvent } from '@sveltejs/kit';
import { RateLimiter } from 'sveltekit-rate-limiter/server';

export const dbItemActionsLimiter = new RateLimiter({
	IP: [[10, '10s']],
});

export const loginLimiter = new RateLimiter({
	IP: [
		[1, 's'],
		[15, '15m'],
	],
});

export const signUpLimiter = new RateLimiter({
	IP: [
		[1, 's'],
		[10, '12h'],
	],
});

export const verifyCodeLimiter = new RateLimiter({
	IP: [
		[1, 's'],
		[15, '15m'],
	],
});

export const sendVerificationCodelimiter = new RateLimiter({
	IP: [
		[1, 's'],
		[10, 'd'],
	],
});

export const changeEmailLimiter = new RateLimiter({
	IP: [
		[1, 's'],
		[10, 'd'],
	],
});

export const changePasswordLimiter = new RateLimiter({
	IP: [[1, 'm']],
});

export const forgotPasswordLimiter = new RateLimiter({
	IP: [
		[1, 's'],
		[10, 'd'],
	],
});

export const verifyEmailLimiter = new RateLimiter({
	IP: [
		[1, 's'],
		[10, 'd'],
	],
});

export const resetPasswordLimiter = new RateLimiter({
	IP: [[10, 'd']],
});

export async function isLimited(rateLimiter: RateLimiter, event: RequestEvent): Promise<boolean> {
	if (getMode() === 'testing') {
		return false;
	}

	return await rateLimiter.isLimited(event);
}
