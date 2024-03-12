import { DateNumber } from '$lib/components/form/release/releaseDate';
import { arrayDiff, arrayIntersection } from '$lib/db/array';
import { describe, it, expect } from 'vitest';

describe('sum test', () => {
	it('adds 1 + 2 to equal 3', () => {
		expect(1 + 2).toBe(3);
	});
});

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

describe.only('date number', () => {
	it('extracts the date', () => {
		const dateNumber = new DateNumber(20231212);
		expect(dateNumber.extractYearMonthDay()).toMatchObject({ year: 2023, month: 12, day: 12 });
	});
	it('changes the year', () => {
		const dateNumber = new DateNumber(20231212);
		expect(dateNumber.setYear(2000)).toBe(20001212);
		expect(dateNumber.setYear(2056)).toBe(20561212);
	});
	it('changes the month', () => {
		const dateNumber = new DateNumber(20231212);
		expect(dateNumber.setMonth(4)).toBe(20230412);
		expect(dateNumber.setMonth(10)).toBe(20231012);
	});
	it('changes the day', () => {
		const dateNumber = new DateNumber(20231212);
		expect(dateNumber.setDay(4)).toBe(20231204);
		expect(dateNumber.setDay(10)).toBe(20231210);
	});
});
