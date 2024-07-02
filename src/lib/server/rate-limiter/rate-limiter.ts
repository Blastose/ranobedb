import { getMode } from '$lib/mode/mode';
import type { RequestEvent } from '@sveltejs/kit';
import { RateLimiter } from 'sveltekit-rate-limiter/server';

export const dbItemActionsLimiter = new RateLimiter({
	IP: [1, '10s'],
});

export const loginLimiter = new RateLimiter({
	IP: [15, '15m'],
});

export const signUpLimiter = new RateLimiter({
	IP: [2, '12h'],
});

export const verifyCodeLimiter = new RateLimiter({
	IP: [15, '15m'],
});

export const sendVerificationCodelimiter = new RateLimiter({
	IP: [2, 'd'],
});

export const changeEmailLimiter = new RateLimiter({
	IP: [1, 'd'],
});

export async function isLimited(rateLimiter: RateLimiter, event: RequestEvent): Promise<boolean> {
	if (getMode() === 'testing') {
		return false;
	}

	return await rateLimiter.isLimited(event);
}
