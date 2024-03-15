import { DateNumber } from '$lib/components/form/release/releaseDate';
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
	it('formats the date', () => {
		const dateNumber1 = new DateNumber(99999999);
		expect(dateNumber1.getDateFormatted()).toBe('TBA');
		const dateNumber2 = new DateNumber(20240103);
		expect(dateNumber2.getDateFormatted()).toBe('2024-01-03');
		const dateNumber3 = new DateNumber(20239999);
		expect(dateNumber3.getDateFormatted()).toBe('2023');
		const dateNumber4 = new DateNumber(20239999);
		expect(dateNumber4.getDateFormatted()).toBe('2023');
		const dateNumber5 = new DateNumber(20231299);
		expect(dateNumber5.getDateFormatted()).toBe('2023-12');
		const dateNumber6 = new DateNumber(20231203);
		expect(dateNumber6.getDateFormatted()).toBe('2023-12-03');
	});
});
