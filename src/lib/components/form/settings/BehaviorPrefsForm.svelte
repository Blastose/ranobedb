<script lang="ts">
	import { addToast } from '$lib/components/toast/Toaster.svelte';
	import type { behaviorSettingsSchema } from '$lib/server/zod/schema';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import SubmitButton from '../SubmitButton.svelte';
	import CheckboxField from '../CheckboxField.svelte';

	interface Props {
		behaviorPrefsForm: SuperValidated<Infer<typeof behaviorSettingsSchema>>;
	}

	let { behaviorPrefsForm }: Props = $props();

	// svelte-ignore state_referenced_locally
	const sForm = superForm(behaviorPrefsForm, {
		dataType: 'json',
		onUpdated({ form }) {
			addToast({
				data: {
					title: form.message?.text || 'An unknown error has occurred.',
					type: form.message?.type ?? 'error',
				},
			});
		},
		invalidateAll: 'force',
		taintedMessage: true,
	});
	const { form, enhance, delayed, submitting, message } = sForm;

	let allSelected = $derived(
		$form.reading_dates.auto_fill_started_date &&
			$form.reading_dates.auto_fill_finished_date &&
			$form.reading_dates.clear_dates_plan_to_read &&
			$form.reading_dates.clear_dates_stalled_dropped_other,
	);

	function toggleAll() {
		sForm.form.update(($form) => {
			$form.reading_dates.auto_fill_started_date = !allSelected;
			$form.reading_dates.auto_fill_finished_date = !allSelected;
			$form.reading_dates.clear_dates_plan_to_read = !allSelected;
			$form.reading_dates.clear_dates_stalled_dropped_other = !allSelected;
			return $form;
		});
	}
</script>

<form method="post" action="?/behaviorprefs" class="flex flex-col gap-4" use:enhance>
	<section class="flex flex-col gap-2">
		<div>
			<h3 class="text-lg font-bold">Reading dates</h3>
			<p class="text-sm">
				Pre-fill the corresponding date with today's date or clear the field when you change the
				reading status of a book or series. You can still edit or clear the date before saving.
			</p>
		</div>

		<button type="button" class="tet-btn w-fit text-xs" onclick={toggleAll}>
			{allSelected ? 'Deselect all' : 'Select all'}
		</button>

		<div>
			<CheckboxField
				form={sForm}
				field="reading_dates.auto_fill_started_date"
				label="Pre-fill started date when status is set to Reading"
				showRequiredSymbolIfRequired={false}
			/>
			<CheckboxField
				form={sForm}
				field="reading_dates.auto_fill_finished_date"
				label="Pre-fill finished date when status is set to Finished"
				showRequiredSymbolIfRequired={false}
			/>
			<CheckboxField
				form={sForm}
				field="reading_dates.clear_dates_plan_to_read"
				label="Clear started and finished dates when status is set to Plan to read"
				showRequiredSymbolIfRequired={false}
			/>
			<CheckboxField
				form={sForm}
				field="reading_dates.clear_dates_stalled_dropped_other"
				label="Clear the started date when status is set to Dropped and clear both dates when status is set to Stalled/Other (new entries only)"
				showRequiredSymbolIfRequired={false}
			/>
		</div>
	</section>

	<SubmitButton delayed={$delayed} submitting={$submitting} text={'Save preferences'} />
</form>
