export function addCharacterBetweenString(str: string, character: string) {
	return `${character}${str.split('').join(`${character}`)}${character}`;
}
