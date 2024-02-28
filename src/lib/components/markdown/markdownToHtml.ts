import { rules, rulesSingleLine } from './markdownRules';
import SimpleMarkdown from 'simple-markdown';

export const htmlOutput: SimpleMarkdown.Output<string> = SimpleMarkdown.outputFor(rules, 'html');

export const converter = (text: string, type: 'full' | 'singleline') => {
	let parser: SimpleMarkdown.Parser;
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
