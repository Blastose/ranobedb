import { describe, expect, it } from 'vitest';
import { anchors } from '$lib/components/api-docs/anchors';
import {
	databaseGroups,
	docToc,
	endpointGroups,
	commonTypes,
	typeLinks,
	userGroups,
} from './endpoints';
import { responseExamples } from './examples';
import { responseTypes, type StandardResponseKey } from './response-types';

const endpoints = endpointGroups.flatMap((group) => group.endpoints);

/** Every id the page renders as a heading, derived from the data. */
const headingIds = new Set<string>([
	...Object.values(anchors),
	...endpointGroups.flatMap((group) => [group.id, ...group.endpoints.map((e) => e.id)]),
]);

describe('API docs data', () => {
	it('gives every endpoint a unique id', () => {
		const ids = [...endpointGroups.map((g) => g.id), ...endpoints.map((e) => e.id)];
		expect(new Set(ids).size).toBe(ids.length);
	});

	it('has a response type and an example for every endpoint with a responseKey', () => {
		const standard: StandardResponseKey[] = ['userPutResponse', 'userDeleteResponse'];
		for (const endpoint of endpoints) {
			if (!endpoint.responseKey) continue;
			expect(responseTypes[endpoint.responseKey], endpoint.id).toBeTypeOf('string');
			expect(standard as string[]).not.toContain(endpoint.responseKey);
			expect(responseExamples[endpoint.responseKey as keyof typeof responseExamples]).toBeTypeOf(
				'string',
			);
		}
	});

	it('points every standard-response endpoint at the shared blocks', () => {
		for (const endpoint of endpoints.filter((e) => e.standardResponse)) {
			expect(endpoint.responseKey, endpoint.id).toBeUndefined();
		}
	});

	it('documents the id of every [id] path as a required path param', () => {
		for (const endpoint of endpoints.filter((e) => e.path.includes('[id]'))) {
			expect(endpoint.pathParams?.[0], endpoint.id).toMatchObject({ name: 'id', required: true });
		}
	});

	it('has a heading for every table-of-contents id', () => {
		const tocIds = docToc.flatMap((group) => [
			...(group.id ? [group.id] : []),
			...group.entries.map((entry) => entry.id),
		]);
		for (const id of tocIds) expect(headingIds.has(id), id).toBe(true);
		expect(new Set(tocIds).size).toBe(tocIds.length);
	});

	it('lists every endpoint group in the table of contents', () => {
		const tocIds = new Set(docToc.flatMap((group) => group.entries.map((entry) => entry.id)));
		for (const group of [...databaseGroups, ...userGroups]) {
			expect(tocIds.has(group.id), group.id).toBe(true);
		}
	});

	it('points every type link at a heading that exists', () => {
		expect(Object.keys(typeLinks).length).toBeGreaterThan(0);
		for (const [name, href] of Object.entries(typeLinks)) {
			expect(href.startsWith('#'), name).toBe(true);
			expect(headingIds.has(href.slice(1)), `${name} -> ${href}`).toBe(true);
		}
		for (const type of [...commonTypes.database, ...commonTypes.user]) {
			expect(typeLinks[type.name], type.name).toBeDefined();
		}
	});
});

/**
 * Keys of a JSON value, nested objects and arrays included. Keys under `c_release_dates` are
 * language codes (the type declares them as `[K in Language]`), so they are not collected.
 */
const jsonKeys = (value: unknown, keys = new Set<string>()): Set<string> => {
	if (Array.isArray(value)) {
		for (const item of value) jsonKeys(item, keys);
	} else if (value && typeof value === 'object') {
		for (const [key, child] of Object.entries(value)) {
			keys.add(key);
			if (key !== 'c_release_dates') jsonKeys(child, keys);
		}
	}
	return keys;
};

/** Names written as `name:` or `name?:` anywhere in a type string. */
const typeKeys = (type: string) =>
	new Set([...type.matchAll(/\b([A-Za-z_]\w*)\??\s*:/g)].map((match) => match[1]));

describe('response types match the examples', () => {
	/**
	 * A cheap drift check, not a type checker. It compares sets of key names for a whole response,
	 * so it cannot tell that a key sits at the wrong depth or has the wrong value type, and a key
	 * that appears in two places is satisfied by either. It does catch a key added to or dropped
	 * from the real response and not mirrored in the type. The `userMeResponse` example is
	 * hand-written (the endpoint needs a token), so it only checks the documented shape. Extra keys
	 * in the type that the example lacks (optional fields) are not flagged.
	 */
	for (const [key, example] of Object.entries(responseExamples)) {
		it(`${key} declares every key of its example`, () => {
			// userMeResponse refers to the objects defined under User > Common types.
			const sources = [
				responseTypes[key as keyof typeof responseTypes],
				...(key === 'userMeResponse' ? commonTypes.user.map((type) => type.type) : []),
			];
			const declared = new Set(sources.flatMap((source) => [...typeKeys(source)]));
			const missing = [...jsonKeys(JSON.parse(example))].filter((name) => !declared.has(name));
			expect(missing).toEqual([]);
		});
	}
});
