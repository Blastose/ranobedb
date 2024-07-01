import { arrayDiff, arrayIntersection } from '$lib/db/array';
import { describe, it, expect } from 'vitest';

describe('array', () => {
	it('diffs the array', () => {
		const diff = arrayDiff([{ id: 1 }, { id: 2 }, { id: 3 }], [{ id: 2 }, { id: 3 }]);
		expect(diff[0]).toEqual({ id: 1 });
	});

	it('intersects the array', () => {
		const diff = arrayIntersection([{ id: 1 }, { id: 2 }, { id: 3 }], [{ id: 2 }, { id: 3 }]);
		expect(diff).toMatchObject([{ id: 2 }, { id: 3 }]);

		const diff2 = arrayIntersection([{ id: 1 }, { id: 2 }, { id: 5 }], [{ id: 2 }, { id: 6 }]);
		expect(diff2).toMatchObject([{ id: 2 }]);
	});
});
