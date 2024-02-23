import { rules } from './markdownRules';
import SimpleMarkdown from 'simple-markdown';

const parser = SimpleMarkdown.parserFor(rules);
export const parse = function (source: string) {
	const blockSource = source;
	return parser(blockSource, { inline: false });
};

export const htmlOutput: SimpleMarkdown.Output<string> = SimpleMarkdown.outputFor(rules, 'html');

export const converter = (text: string) => {
	return htmlOutput(parse(text));
};
