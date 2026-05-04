import { rules, rulesSingleLine } from './markdownRules';
import SimpleMarkdown, { type Output, type Parser } from '$lib/components/markdown/simple-markdown';

export const htmlOutput: Output<string> = SimpleMarkdown.outputFor(rules, 'html');

export const converter = (text: string, type: 'full' | 'singleline') => {
	let parser: Parser;
	if (type === 'full') {
		parser = SimpleMarkdown.parserFor(rules);
	} else {
		parser = SimpleMarkdown.parserFor(rulesSingleLine);
		text = text.replaceAll('\n', '');
	}

	const parse = (source: string) => {
		const blockSource = source;
		return parser(blockSource, { inline: false });
	};

	return htmlOutput(parse(text));
};
