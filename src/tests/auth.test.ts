import { generateIdFromEntropySize, generateUserId } from '$lib/server/lucia/lucia';
import { describe, it, expect } from 'vitest';

describe('generate', () => {
	it('generates user id', () => {
		const id = generateUserId(15);
		expect(id.length).toBe(15);
	});

	it('generates entropy id', () => {
		for (let i = 0; i < 100; i++) {
			const id = generateIdFromEntropySize(10);
			expect(id).not.toMatch(/[A-Z]/);
		}

		// check output length
		const id1 = generateIdFromEntropySize(25);
		expect(id1.length).toBe(40);

		// check padding is omitted
		const id3 = generateIdFromEntropySize(8);
		expect(id3).not.toMatch(/=/);
	});
});
