import SimpleMarkdown from 'simple-markdown';

type SimpleMarkdownRule = SimpleMarkdown.ParserRule & SimpleMarkdown.HtmlOutputRule;

let order = 0;

export const rules = {
	Array: Object.assign({}, SimpleMarkdown.defaultRules.Array, {
		order: order++,
	}),
	heading: Object.assign({}, SimpleMarkdown.defaultRules.heading, {
		order: order++,
		match: SimpleMarkdown.blockRegex(/^ *(#{1,6})([^\n]+?)#* *\n/),
	}),
	hr: Object.assign({}, SimpleMarkdown.defaultRules.hr, {
		order: order++,
		match: SimpleMarkdown.blockRegex(/^( *[-*_]){3,} *\n/),
	}),
	codeBlock: Object.assign({}, SimpleMarkdown.defaultRules.codeBlock, {
		order: order++,
		match: SimpleMarkdown.blockRegex(/^(?: {4}[^\n]+\n*)+\n/),
	}),
	fence: Object.assign({}, SimpleMarkdown.defaultRules.fence, {
		order: order++,
		match: SimpleMarkdown.blockRegex(
			/^ *(`{3,}|~{3,}) *(?:(\S+) *)?\n([\s\S]+?)\n?\1 *\n/,
		) satisfies SimpleMarkdown.MatchFunction,
	}) satisfies SimpleMarkdownRule,
	spoiler: {
		order: order++,
		match: SimpleMarkdown.inlineRegex(/^>!\s*((.|\n(?!\n))*?)\s*!</),
		parse: function (capture, parse, state) {
			return {
				content: parse(capture[1], state),
			};
		},
		html: function (node, output, state) {
			return SimpleMarkdown.htmlTag('span', output(node.content, state), { class: 'spoiler' });
		},
	} satisfies SimpleMarkdownRule,
	blockQuote: Object.assign({}, SimpleMarkdown.defaultRules.blockQuote, {
		order: order++,
		match: SimpleMarkdown.blockRegex(
			/^( {0,3}>(?!!).*?(?=\n\n|\n +\n))(?:\n| )*/s,
		) satisfies SimpleMarkdown.MatchFunction,
	}) satisfies SimpleMarkdownRule,
	list: Object.assign({}, SimpleMarkdown.defaultRules.list, {
		order: order++,
	}),
	table: Object.assign({}, SimpleMarkdown.defaultRules.table, {
		order: order++,
	}),
	newline: Object.assign({}, SimpleMarkdown.defaultRules.newline, {
		order: order++,
	}),
	paragraph: Object.assign({}, SimpleMarkdown.defaultRules.paragraph, {
		order: order++,
		match: SimpleMarkdown.blockRegex(/^((?:[^\n]|\n(?! *\n))+)\n/),
		html: function (node, output, state) {
			if (node.content.length === 0) return '';
			return SimpleMarkdown.htmlTag('p', output(node.content, state));
		} satisfies SimpleMarkdown.HtmlNodeOutput,
	}) satisfies SimpleMarkdownRule,
	escape: Object.assign({}, SimpleMarkdown.defaultRules.escape, {
		order: order++,
	}),
	tableSeparator: Object.assign({}, SimpleMarkdown.defaultRules.tableSeparator, {
		order: order++,
	}),
	autolink: Object.assign({}, SimpleMarkdown.defaultRules.autolink, {
		order: order++,
	}),
	url: Object.assign({}, SimpleMarkdown.defaultRules.url, {
		order: order++,
		match: function (source, state, prevCapture) {
			return SimpleMarkdown.inlineRegex(/^((?:https?):\/\/|www\.)(?:[a-zA-Z0-9-]+\.?)+[^\s<]*/)(
				source,
				state,
				prevCapture,
			);
		} satisfies SimpleMarkdown.MatchFunction,
		parse: function (capture) {
			// Add backpedal logic from markedjs https://github.com/markedjs/marked/blob/7c1e114f9f7949ba4033366582d2a4ddf09e85af/lib/marked.cjs#L1058
			// See https://github.github.com/gfm/#extended-autolink-path-validation
			const backpedal =
				/(?:[^?!.,:;*_'"~()&[\]]+|\([^)]*\)|\[[^\]]*\]|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)\]]+(?!$))+/;

			const initial = capture[0];
			let backpedalCapture = initial;
			let prevBackpedalCapture = backpedalCapture;
			do {
				const backpedalRegexResponse = backpedal.exec(backpedalCapture);
				if (!backpedalRegexResponse) {
					break;
				}
				prevBackpedalCapture = backpedalCapture;
				backpedalCapture = backpedalRegexResponse[0];
			} while (prevBackpedalCapture !== backpedalCapture);

			return {
				type: 'link',
				content: [
					{
						type: 'text',
						content: backpedalCapture,
					},
				],
				target: backpedalCapture,
				title: undefined,
			};
		} satisfies SimpleMarkdown.ParseFunction,
	}),
	link: Object.assign({}, SimpleMarkdown.defaultRules.link, {
		order: order++,
		html: function (node, output, state) {
			const attributes = {
				href: SimpleMarkdown.sanitizeUrl(node.target),
				title: node.title,
				rel: 'noopener nofollow ugc',
				target: '_blank',
			};
			return SimpleMarkdown.htmlTag('a', output(node.content, state), attributes);
		} satisfies SimpleMarkdown.HtmlNodeOutput,
	}),
	em: Object.assign({}, SimpleMarkdown.defaultRules.em, {
		order: order++,
	}),
	strong: Object.assign({}, SimpleMarkdown.defaultRules.strong, {
		order: order++,
	}),
	inlineCode: Object.assign({}, SimpleMarkdown.defaultRules.inlineCode, {
		order: order++,
	}),
	br: Object.assign({}, SimpleMarkdown.defaultRules.br, {
		order: order++,
		match: SimpleMarkdown.anyScopeRegex(/^\n/),
	}) satisfies SimpleMarkdownRule,
	text: Object.assign({}, SimpleMarkdown.defaultRules.text, {
		order: order++,
		match: SimpleMarkdown.anyScopeRegex(/^[\s\S]+?(?=[^0-9A-Za-z\s]|\n\n|\n|\w+:\S|$)/),
	}),
};

export const rulesSingleLine = {
	Array: Object.assign({}, SimpleMarkdown.defaultRules.Array, {
		order: order++,
	}),
	spoiler: {
		order: order++,
		match: SimpleMarkdown.inlineRegex(/^>!\s*((.|\n(?!\n))*?)\s*!</),
		parse: function (capture, parse, state) {
			return {
				content: parse(capture[1], state),
			};
		},
		html: function (node, output, state) {
			return SimpleMarkdown.htmlTag('span', output(node.content, state), { class: 'spoiler' });
		},
	} satisfies SimpleMarkdownRule,
	newline: Object.assign({}, SimpleMarkdown.defaultRules.newline, {
		order: order++,
	}),
	paragraph: Object.assign({}, SimpleMarkdown.defaultRules.paragraph, {
		order: order++,
		match: SimpleMarkdown.blockRegex(/^((?:[^\n]|\n(?! *\n))+)\n/),
		html: function (node, output, state) {
			if (node.content.length === 0) return '';
			return SimpleMarkdown.htmlTag('p', output(node.content, state));
		} satisfies SimpleMarkdown.HtmlNodeOutput,
	}) satisfies SimpleMarkdownRule,
	autolink: Object.assign({}, SimpleMarkdown.defaultRules.autolink, {
		order: order++,
	}),
	url: Object.assign({}, SimpleMarkdown.defaultRules.url, {
		order: order++,
	}),
	link: Object.assign({}, SimpleMarkdown.defaultRules.link, {
		order: order++,
		html: function (node, output, state) {
			const attributes = {
				href: SimpleMarkdown.sanitizeUrl(node.target),
				title: node.title,
				rel: 'noopener nofollow ugc',
				target: '_blank',
			};
			return SimpleMarkdown.htmlTag('a', output(node.content, state), attributes);
		} satisfies SimpleMarkdown.HtmlNodeOutput,
	}),
	text: Object.assign({}, SimpleMarkdown.defaultRules.text, {
		order: order++,
		match: SimpleMarkdown.anyScopeRegex(/^[\s\S]+?(?=[^0-9A-Za-z\s]|\n\n|\n|\w+:\S|$)/),
	}),
};
