export type TypePart = { text: string; href: string | undefined };

const escapeRegExp = (value: string) => value.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Splits a type string so shared type names (`Language`, `Date`...) can render as links.
 * Only whole words match, so `Dated` is left alone.
 */
export function splitTypeParts(type: string, typeLinks: Record<string, string>): TypePart[] {
	const names = Object.keys(typeLinks);
	if (!names.length) return [{ text: type, href: undefined }];
	// The capture group makes split() keep the matched names at the odd indices.
	const pattern = new RegExp(String.raw`\b(${names.map(escapeRegExp).join('|')})\b`);
	return type
		.split(pattern)
		.map((text, index) => ({ text, href: index % 2 ? typeLinks[text] : undefined }))
		.filter((part) => part.text !== '');
}

/** Unions with at least this many members are shown as a chip list instead of one long line. */
const LONG_UNION = 12;

/** The members of a union of string literals such as `'a' | 'b'`, or null if it is not a long one. */
export function longUnionMembers(type: string): string[] | null {
	const members = type.split(' | ');
	if (members.length < LONG_UNION) return null;
	if (!members.every((member) => /^'[^']+'$/.test(member))) return null;
	return members.map((member) => member.slice(1, -1));
}
