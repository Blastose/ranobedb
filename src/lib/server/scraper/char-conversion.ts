const dict = {
	12288: 32,
	65281: 33,
	65282: 34,
	65283: 35,
	65284: 36,
	65285: 37,
	65286: 38,
	65287: 39,
	65288: 40,
	65289: 41,
	65290: 42,
	65291: 43,
	65292: 44,
	65293: 45,
	65294: 46,
	65295: 47,
	65296: 48,
	65297: 49,
	65298: 50,
	65299: 51,
	65300: 52,
	65301: 53,
	65302: 54,
	65303: 55,
	65304: 56,
	65305: 57,
	65306: 58,
	65307: 59,
	65308: 60,
	65309: 61,
	65310: 62,
	65311: 63,
	65312: 64,
	65313: 65,
	65314: 66,
	65315: 67,
	65316: 68,
	65317: 69,
	65318: 70,
	65319: 71,
	65320: 72,
	65321: 73,
	65322: 74,
	65323: 75,
	65324: 76,
	65325: 77,
	65326: 78,
	65327: 79,
	65328: 80,
	65329: 81,
	65330: 82,
	65331: 83,
	65332: 84,
	65333: 85,
	65334: 86,
	65335: 87,
	65336: 88,
	65337: 89,
	65338: 90,
	65339: 91,
	65340: 92,
	65341: 93,
	65342: 94,
	65343: 95,
	65344: 96,
	65345: 97,
	65346: 98,
	65347: 99,
	65348: 100,
	65349: 101,
	65350: 102,
	65351: 103,
	65352: 104,
	65353: 105,
	65354: 106,
	65355: 107,
	65356: 108,
	65357: 109,
	65358: 110,
	65359: 111,
	65360: 112,
	65361: 113,
	65362: 114,
	65363: 115,
	65364: 116,
	65365: 117,
	65366: 118,
	65367: 119,
	65368: 120,
	65369: 121,
	65370: 122,
	65371: 123,
	65372: 124,
	65373: 125,
	65374: 126,
	12316: 126,
};

export function fullToHalf(input: string): string;
export function fullToHalf(input: null): null;
export function fullToHalf(input: string | null | undefined): string | null;
export function fullToHalf(input: string | null | undefined): string | null {
	if (!input) {
		return null;
	}

	const convertedCodePoints = [];
	for (let i = 0; i < input.length; i++) {
		const halfWidthCodePoint = dict[input.charCodeAt(i) as keyof typeof dict] as number | undefined;

		if (halfWidthCodePoint) {
			convertedCodePoints.push(halfWidthCodePoint);
		} else {
			convertedCodePoints.push(input.charCodeAt(i));
		}
	}
	const result = convertedCodePoints.map((code) => String.fromCharCode(code)).join('');
	return result;
}
