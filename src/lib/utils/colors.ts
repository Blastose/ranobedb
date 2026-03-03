import { defaultUserListLabelsArray, defaultUserListLabelsCssClassMap } from '$lib/db/dbConsts';

export function defaultUserListLabelsCssClass(label: string | undefined): string {
	if (!label) {
		return '';
	}

	if (defaultUserListLabelsArray.includes(label as any)) {
		return defaultUserListLabelsCssClassMap[label];
	}

	return '';
}
