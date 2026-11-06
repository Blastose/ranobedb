export type Method = 'GET' | 'PUT' | 'DELETE';

export type Param = {
	name: string;
	type: string;
	/** Omit for shared type definitions, which have no required/optional flag. */
	required?: boolean;
	/** Limited inline HTML: `<code>` and internal `<a>` links only. Never build this from input. */
	description?: string;
	/** Rendered after `description` as `Default <code>value</code>.` */
	default?: string;
};

export type Endpoint<K extends string = string> = {
	id: string;
	method: Method;
	path: string;
	summary: string;
	/** Whether the endpoint requires a bearer token. Rendered as a tag on user endpoints only. */
	auth: boolean;
	/** Parameters taken from the path, such as `[id]`. */
	pathParams?: Param[];
	params?: Param[];
	body?: Param[];
	bodyNote?: string;
	responseKey?: K;
	/** PUT and DELETE endpoints share the response blocks on this page. */
	standardResponse?: boolean;
	curl?: string;
	/** Example is hand-written because the endpoint needs authentication. */
	illustrative?: boolean;
};

export type EndpointGroup<K extends string = string> = {
	section: 'database' | 'user';
	id: string;
	title: string;
	/** Example request shown once above the group's endpoints. */
	curl?: string;
	endpoints: Endpoint<K>[];
};

export type TocEntry = {
	id: string;
	label: string;
	method?: Method;
	/** Endpoint entry; left out of the compact (mobile) list. */
	indent?: boolean;
};

export type TocGroup = {
	label: string;
	id?: string;
	entries: TocEntry[];
};

export type StatusRow = {
	status: number;
	/** Limited inline HTML: `<code>` only. */
	meaning: string;
};

export type ErrorExample = {
	status: number;
	reason: string;
	note: string;
	body: string;
};
