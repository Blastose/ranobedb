import { dev } from '$app/environment';
import { CF_TURNSTILE_SECRET_KEY } from '$env/static/private';

type TurnStileErrorCode =
	| 'missing-input-secret'
	| 'invalid-input-secret'
	| 'missing-input-response'
	| 'invalid-input-response'
	| 'bad-request'
	| 'timeout-or-duplicate'
	| 'internal-error';

type TurnstileResponse = {
	success: boolean;
	challenge_ts?: string;
	hostname?: string;
	'error-codes': TurnStileErrorCode[];
	action?: string;
	cdata?: string;
};

export async function validateTurnstile(params: { request: Request; body: FormData }) {
	let secretKey: string;
	if (dev) {
		// secretKey = '1x0000000000000000000000000000000AA';
		// secretKey = '2x0000000000000000000000000000000AA';
		secretKey = CF_TURNSTILE_SECRET_KEY;
	} else {
		secretKey = CF_TURNSTILE_SECRET_KEY;
	}

	const { request, body } = params;
	const token = body.get('cf-turnstile-response') ?? '';
	const ip = request.headers.get('CF-Connecting-IP') ?? '';

	const formData = new FormData();
	formData.append('secret', secretKey);
	formData.append('response', token);
	formData.append('remoteip', ip);

	const url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
	const result = await fetch(url, {
		body: formData,
		method: 'POST',
	});
	const outcome = (await result.json()) as TurnstileResponse;

	return outcome.success;
}
