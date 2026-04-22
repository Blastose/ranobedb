import { fullToHalf } from '$lib/server/scraper/char-conversion';
import { describe, it, expect } from 'vitest';

describe('fullToHalf', () => {
	it('should convert full-width numbers to half-width', () => {
		expect(fullToHalf('１２３４５')).toBe('12345');
	});

	it('should convert full-width Latin alphabet (uppercase) to half-width', () => {
		expect(fullToHalf('ＡＢＣＤＥ')).toBe('ABCDE');
	});

	it('should convert full-width Latin alphabet (lowercase) to half-width', () => {
		expect(fullToHalf('ａｂｃｄｅ')).toBe('abcde');
	});

	it('should convert the full-width space to a standard space', () => {
		expect(fullToHalf('君の名は。　公式')).toBe('君の名は。 公式');
	});

	it('should convert full-width symbols commonly used in titles', () => {
		expect(fullToHalf('劇場版：Ｚ（ゼット）？！')).toBe('劇場版:Z(ゼット)?!');
	});

	it('should convert the ～ and 〜 to a tilde (~)', () => {
		expect(fullToHalf('～上〜下')).toBe('~上~下');
	});

	it('should convert full-width angle brackets ＜ ＞', () => {
		expect(fullToHalf('＜新訳＞')).toBe('<新訳>');
	});

	it('should not convert Japanese corner brackets 「 」 or 『 』', () => {
		const quotes = '「吾輩は猫である」';
		expect(fullToHalf(quotes)).toBe(quotes);
	});

	it('should return null for null or undefined input', () => {
		expect(fullToHalf(null)).toBeNull();
		expect(fullToHalf(undefined)).toBeNull();
	});

	it('should return an empty string for an empty string input', () => {
		expect(fullToHalf('')).toBeNull();
	});

	it('should not affect standard half-width characters', () => {
		const standard = 'Hello 123 !';
		expect(fullToHalf(standard)).toBe(standard);
	});

	it('should ignore Kanji and Hiragana/Katakana characters', () => {
		const mixed = '呪術廻戦 ０';
		expect(fullToHalf(mixed)).toBe('呪術廻戦 0');
	});
});
