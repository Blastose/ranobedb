import { describe, expect, it } from 'vitest';
import { longUnionMembers, splitTypeParts } from './type-parts';

const links = {
	Language: '#db-common-types',
	ReadingStatus: '#user-common-types',
	Date: '#user-common-types',
};

describe('splitTypeParts', () => {
	it('links a type name inside an array type', () => {
		expect(splitTypeParts('Language[]', links)).toEqual([
			{ text: 'Language', href: '#db-common-types' },
			{ text: '[]', href: undefined },
		]);
	});

	it('links a name in a union and keeps the rest plain', () => {
		expect(splitTypeParts('Language[] | null', links)).toEqual([
			{ text: 'Language', href: '#db-common-types' },
			{ text: '[] | null', href: undefined },
		]);
	});

	it('links a type that is only a name', () => {
		expect(splitTypeParts('ReadingStatus', links)).toEqual([
			{ text: 'ReadingStatus', href: '#user-common-types' },
		]);
	});

	it('keeps a type with no shared name as one part', () => {
		expect(splitTypeParts("'and' | 'or'", links)).toEqual([
			{ text: "'and' | 'or'", href: undefined },
		]);
	});

	it('does not link a name inside a longer word', () => {
		expect(splitTypeParts('Dated', links)).toEqual([{ text: 'Dated', href: undefined }]);
		expect(splitTypeParts('MyLanguage[]', links)).toEqual([
			{ text: 'MyLanguage[]', href: undefined },
		]);
	});

	it('escapes regex characters in names', () => {
		expect(splitTypeParts('a.b', { 'a.b': '#x' })).toEqual([{ text: 'a.b', href: '#x' }]);
		expect(splitTypeParts('axb', { 'a.b': '#x' })).toEqual([{ text: 'axb', href: undefined }]);
	});

	it('returns the type unchanged when there are no links', () => {
		expect(splitTypeParts('number', {})).toEqual([{ text: 'number', href: undefined }]);
	});
});

describe('longUnionMembers', () => {
	const many = Array.from({ length: 12 }, (_, index) => `'v${index}'`).join(' | ');

	it('returns the members of a long union of string literals', () => {
		expect(longUnionMembers(many)).toHaveLength(12);
		expect(longUnionMembers(many)?.[0]).toBe('v0');
	});

	it('leaves short unions and other types alone', () => {
		expect(longUnionMembers("'and' | 'or'")).toBeNull();
		expect(longUnionMembers(`${many} | null`)).toBeNull();
		expect(longUnionMembers('number')).toBeNull();
	});
});
