import { get } from 'svelte/store';
import type { FormFieldProxy } from 'sveltekit-superforms';
import type { BehaviorSettings } from '$lib/server/zod/schema';
import type { defaultUserListLabelsArray } from '$lib/db/dbConsts';

export function todayISO(): string {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, '0');
	const day = String(now.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

export function getReadingStatusDates(params: {
	readingStatus: (typeof defaultUserListLabelsArray)[number];
	started: string | null | undefined;
	finished: string | null | undefined;
	inList: boolean;
	prefs: BehaviorSettings;
}): { started: string | null | undefined; finished: string | null | undefined } {
	let { started, finished } = params;
	const readingStatus = params.readingStatus;
	const autoFillStarted = params.prefs.reading_dates.auto_fill_started_date;
	const autoFillFinished = params.prefs.reading_dates.auto_fill_finished_date;
	const clearDatesPlanToRead = params.prefs.reading_dates.clear_dates_plan_to_read;
	const clearDatesStalledDroppedOther =
		params.prefs.reading_dates.clear_dates_stalled_dropped_other;

	switch (readingStatus) {
		case 'Finished':
			if (autoFillFinished && !finished) {
				finished = todayISO();
			}
			break;
		case 'Reading':
			if (autoFillStarted && !started) {
				started = todayISO();
			}
			// Clear finished date if not in list. For entries already in the list, we keep it since the user may be re-reading
			if (!params.inList) {
				finished = null;
			}
			break;
		case 'Plan to read':
			if (clearDatesPlanToRead) {
				started = null;
				finished = null;
			}
			break;
		case 'Stalled':
		case 'Other':
			if (clearDatesStalledDroppedOther && !params.inList) {
				started = null;
				finished = null;
			}
			break;
		case 'Dropped':
			if (clearDatesStalledDroppedOther && !params.inList) {
				started = null;
			}
			break;
		default:
			break;
	}

	return { started, finished };
}

export function applyReadingStatusToForm<S extends string | null | undefined>(
	startedField: FormFieldProxy<S>,
	finishedField: FormFieldProxy<S>,
	readingStatus: (typeof defaultUserListLabelsArray)[number],
	inList: boolean,
	prefs: BehaviorSettings,
): void {
	const { started, finished } = getReadingStatusDates({
		readingStatus: readingStatus,
		started: get(startedField.value),
		finished: get(finishedField.value),
		inList,
		prefs,
	});
	startedField.value.set(started as S);
	finishedField.value.set(finished as S);
}
