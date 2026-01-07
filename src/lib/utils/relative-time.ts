const unitsInSeconds = {
	'yr.': 365 * 24 * 60 * 60 * 1,
	'mo.': (365 / 12) * 24 * 60 * 60 * 1,
	day: 24 * 60 * 60 * 1,
	'hr.': 60 * 60 * 1,
	'min.': 60 * 1,
	'sec.': 1,
	now: -9999,
};

const unitsInSecondsFull = {
	year: 365 * 24 * 60 * 60 * 1,
	month: (365 / 12) * 24 * 60 * 60 * 1,
	day: 24 * 60 * 60 * 1,
	hour: 60 * 60 * 1,
	minutes: 60 * 1,
	seconds: 1,
	now: -9999,
};

const pluralize = (word: string, amount: number) => {
	if (word.endsWith('.')) {
		return word;
	}
	return amount > 1 ? `${word}s` : word;
};

const formatRelativeTimeOutput = (difference: number, unit: string) => {
	if (difference <= 0) {
		return 'just now';
	}

	return `${difference} ${pluralize(unit, difference)} ago`;
};

export const relativeTime = (date: number, full?: boolean): string => {
	const unixTimestampSeconds = date;
	const unixTimeNowSeconds = Math.floor(new Date().getTime() / 1000);
	const differenceInSeconds = unixTimeNowSeconds - unixTimestampSeconds;
	if (!full) {
		for (const key in unitsInSeconds) {
			const unitValue = unitsInSeconds[key as keyof typeof unitsInSeconds];
			if (differenceInSeconds > unitValue) {
				return formatRelativeTimeOutput(Math.floor(differenceInSeconds / unitValue), key);
			}
		}
	} else {
		for (const key in unitsInSecondsFull) {
			const unitValue = unitsInSecondsFull[key as keyof typeof unitsInSecondsFull];
			if (differenceInSeconds > unitValue) {
				return formatRelativeTimeOutput(Math.floor(differenceInSeconds / unitValue), key);
			}
		}
	}

	return 'unknown time ago';
};
