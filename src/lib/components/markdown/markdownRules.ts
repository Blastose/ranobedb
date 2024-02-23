import SimpleMarkdown from 'simple-markdown';

type SimpleMarkdownRule = SimpleMarkdown.ParserRule & SimpleMarkdown.HtmlOutputRule;

let order = 0;

export const rules = {
	Array: Object.assign({}, SimpleMarkdown.defaultRules.Array, {
		order: order++
	}),
	heading: Object.assign({}, SimpleMarkdown.defaultRules.heading, {
		order: order++,
		match: SimpleMarkdown.blockRegex(/^ *(#{1,6})([^\n]+?)#* *\n/)
	}),
	hr: Object.assign({}, SimpleMarkdown.defaultRules.hr, {
		order: order++,
		match: SimpleMarkdown.blockRegex(/^( *[-*_]){3,} *\n/)
	}),
	codeBlock: Object.assign({}, SimpleMarkdown.defaultRules.codeBlock, {
		order: order++,
		match: SimpleMarkdown.blockRegex(/^(?: {4}[^\n]+\n*)+\n/)
	}),
	fence: Object.assign({}, SimpleMarkdown.defaultRules.fence, {
		order: order++,
		match: SimpleMarkdown.blockRegex(
			/^ *(`{3,}|~{3,}) *(?:(\S+) *)?\n([\s\S]+?)\n?\1 *\n/
		) satisfies SimpleMarkdown.MatchFunction
	}) satisfies SimpleMarkdownRule,
	spoiler: {
		order: order++,
		match: SimpleMarkdown.inlineRegex(/^>!\s*((.|\n(?!\n))*?)\s*!</),
		parse: function (capture, parse, state) {
			return {
				content: parse(capture[1], state)
			};
		},
		html: function (node, output, state) {
			return SimpleMarkdown.htmlTag('span', output(node.content, state), { class: 'spoiler' });
		}
	} satisfies SimpleMarkdownRule,
	blockQuote: Object.assign({}, SimpleMarkdown.defaultRules.blockQuote, {
		order: order++,
		match: SimpleMarkdown.blockRegex(
			/^( {0,3}>(?!!).*?(?=\n\n|\n +\n))(?:\n| )*/s
		) satisfies SimpleMarkdown.MatchFunction
	}) satisfies SimpleMarkdownRule,
	list: Object.assign({}, SimpleMarkdown.defaultRules.list, {
		order: order++
	}),
	table: Object.assign({}, SimpleMarkdown.defaultRules.table, {
		order: order++
	}),
	newline: Object.assign({}, SimpleMarkdown.defaultRules.newline, {
		order: order++
	}),
	paragraph: Object.assign({}, SimpleMarkdown.defaultRules.paragraph, {
		order: order++,
		match: SimpleMarkdown.blockRegex(/^((?:[^\n]|\n(?! *\n))+)\n/),
		html: function (node, output, state) {
			if (node.content.length === 0) return '';
			return SimpleMarkdown.htmlTag('p', output(node.content, state));
		} satisfies SimpleMarkdown.HtmlNodeOutput
	}) satisfies SimpleMarkdownRule,
	escape: Object.assign({}, SimpleMarkdown.defaultRules.escape, {
		order: order++
	}),
	tableSeparator: Object.assign({}, SimpleMarkdown.defaultRules.tableSeparator, {
		order: order++
	}),
	autolink: Object.assign({}, SimpleMarkdown.defaultRules.autolink, {
		order: order++
	}),
	url: Object.assign({}, SimpleMarkdown.defaultRules.url, {
		order: order++
	}),
	link: Object.assign({}, SimpleMarkdown.defaultRules.link, {
		order: order++
	}),
	em: Object.assign({}, SimpleMarkdown.defaultRules.em, {
		order: order++
	}),
	strong: Object.assign({}, SimpleMarkdown.defaultRules.strong, {
		order: order++
	}),
	inlineCode: Object.assign({}, SimpleMarkdown.defaultRules.inlineCode, {
		order: order++
	}),
	br: Object.assign({}, SimpleMarkdown.defaultRules.br, {
		order: order++,
		match: SimpleMarkdown.anyScopeRegex(/^\n/)
	}) satisfies SimpleMarkdownRule,
	text: Object.assign({}, SimpleMarkdown.defaultRules.text, {
		order: order++,
		match: SimpleMarkdown.anyScopeRegex(/^[\s\S]+?(?=[^0-9A-Za-z\s]|\n\n|\n|\w+:\S|$)/)
	})
};
