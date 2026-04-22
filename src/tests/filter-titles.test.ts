import { filter } from '$lib/server/scraper/bookwalker/filter-bw-titles';
import { describe, it, expect } from 'vitest';

describe('filter function', () => {
	it('should remove static filler words from the predefined list', () => {
		const input = 'BOOK☆WALKER special edition勇者の物語【特典付】';
		expect(filter(input)).toBe('勇者の物語');
		const input2 = '勇者の物語【電子特別版】';
		expect(filter(input2)).toBe('勇者の物語');
	});

	it('should remove dynamic publisher information when provided', () => {
		const input = '勇者の物語（ファンタジー）';
		const publisher = 'ファンタジー';
		expect(filter(input, publisher)).toBe('勇者の物語');
	});

	it('should remove dynamic label information when provided', () => {
		const input = '勇者の物語【電撃】';
		const label = '電撃';
		expect(filter(input, null, label)).toBe('勇者の物語');
	});

	it('should extract the series title when using "「...」シリーズ" format', () => {
		const input = '「勇者の冒険」シリーズ';
		expect(filter(input)).toBe('勇者の冒険');
	});

	it('should remove complex tags', () => {
		expect(filter('勇者の物語【書下ろし・イラスト入り】')).toBe('勇者の物語');
		expect(filter('勇者の物語【書き下ろし・本文イラスト6枚付き】')).toBe('勇者の物語');
		expect(filter('勇者の物語【電子書籍オリジナル特典付き】')).toBe('勇者の物語');
		expect(filter('勇者の物語【電子限定SS付】')).toBe('勇者の物語');
	});

	it('should clean up trailing empty parentheses', () => {
		const input = '勇者の物語()';
		expect(filter(input)).toBe('勇者の物語');
	});

	it('should return the original string if no matches are found', () => {
		const input = '純粋なタイトル';
		expect(filter(input)).toBe('純粋なタイトル');
	});
});
