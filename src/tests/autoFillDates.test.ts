import { getReadingStatusDates } from '$lib/utils/autoFillDates';
import { describe, it, expect } from 'vitest';

const allOn = {
	reading_dates: {
		auto_fill_started_date: true,
		auto_fill_finished_date: true,
		clear_dates_plan_to_read: true,
		clear_dates_stalled_dropped_other: true,
	},
};

const allOff = {
	reading_dates: {
		auto_fill_started_date: false,
		auto_fill_finished_date: false,
		clear_dates_plan_to_read: false,
		clear_dates_stalled_dropped_other: false,
	},
};

describe('apply reading status dates', () => {
	describe('Finished', () => {
		it('fills finished when empty and auto fill finished is on', () => {
			const r = getReadingStatusDates({
				readingStatus: 'Finished',
				started: null,
				finished: null,
				inList: false,
				prefs: allOn,
			});
			expect(r.finished).toBeTruthy();
			expect(r.started).toBeNull();
		});

		it('does not overwrite an existing finished date', () => {
			const r = getReadingStatusDates({
				readingStatus: 'Finished',
				started: null,
				finished: '2020-01-01',
				inList: false,
				prefs: allOn,
			});
			expect(r.finished).toBe('2020-01-01');
		});

		it('does not fill finished when auto fill finished is off', () => {
			const r = getReadingStatusDates({
				readingStatus: 'Finished',
				started: null,
				finished: null,
				inList: false,
				prefs: allOff,
			});
			expect(r.finished).toBeNull();
		});
	});

	describe('Reading', () => {
		it('fills started when empty and auto fill started is on', () => {
			const r = getReadingStatusDates({
				readingStatus: 'Reading',
				started: null,
				finished: null,
				inList: false,
				prefs: allOn,
			});
			expect(r.started).toBeTruthy();
			expect(r.finished).toBeNull();
		});

		it('does not overwrite an existing started date', () => {
			const r = getReadingStatusDates({
				readingStatus: 'Reading',
				started: '2021-05-05',
				finished: null,
				inList: false,
				prefs: allOn,
			});
			expect(r.started).toBe('2021-05-05');
		});

		it('does not fill started when auto fill started is off', () => {
			const r = getReadingStatusDates({
				readingStatus: 'Reading',
				started: null,
				finished: null,
				inList: false,
				prefs: allOff,
			});
			expect(r.started).toBeNull();
		});
	});

	describe('Plan to read', () => {
		it('clears both dates when clear dates plan to read is on', () => {
			const r = getReadingStatusDates({
				readingStatus: 'Plan to read',
				started: '2021-05-05',
				finished: '2022-06-06',
				inList: false,
				prefs: allOn,
			});
			expect(r.started).toBeNull();
			expect(r.finished).toBeNull();
		});

		it('keeps both dates when clear dates plan to read is off', () => {
			const r = getReadingStatusDates({
				readingStatus: 'Plan to read',
				started: '2021-05-05',
				finished: '2022-06-06',
				inList: false,
				prefs: allOff,
			});
			expect(r.started).toBe('2021-05-05');
			expect(r.finished).toBe('2022-06-06');
		});
	});

	describe('Stalled / Dropped / Other', () => {
		for (const status of ['Stalled', 'Dropped', 'Other'] as const) {
			const clearsFinished = status !== 'Dropped';
			it(`clears started${clearsFinished ? ' and finished' : ''} for new entries (not in list) when option is on: ${status}`, () => {
				const r = getReadingStatusDates({
					readingStatus: status,
					started: '2021-05-05',
					finished: '2022-06-06',
					inList: false,
					prefs: allOn,
				});
				expect(r.started).toBeNull();
				expect(r.finished).toBe(clearsFinished ? null : '2022-06-06');
			});

			it(`keeps dates for existing entries (in list) even when option is on: ${status}`, () => {
				const r = getReadingStatusDates({
					readingStatus: status,
					started: '2021-05-05',
					finished: '2022-06-06',
					inList: true,
					prefs: allOn,
				});
				expect(r.started).toBe('2021-05-05');
				expect(r.finished).toBe('2022-06-06');
			});

			it(`keeps dates when option is off: ${status}`, () => {
				const r = getReadingStatusDates({
					readingStatus: status,
					started: '2021-05-05',
					finished: '2022-06-06',
					inList: false,
					prefs: allOff,
				});
				expect(r.started).toBe('2021-05-05');
				expect(r.finished).toBe('2022-06-06');
			});
		}
	});

	describe('Reading', () => {
		it('clears finished for new entries (not in list)', () => {
			const r = getReadingStatusDates({
				readingStatus: 'Reading',
				started: '2021-05-05',
				finished: '2022-06-06',
				inList: false,
				prefs: allOn,
			});
			expect(r.started).toBe('2021-05-05');
			expect(r.finished).toBeNull();
		});

		it('keeps finished for existing entries (in list, re-reading)', () => {
			const r = getReadingStatusDates({
				readingStatus: 'Reading',
				started: '2021-05-05',
				finished: '2022-06-06',
				inList: true,
				prefs: allOn,
			});
			expect(r.started).toBe('2021-05-05');
			expect(r.finished).toBe('2022-06-06');
		});
	});
});
