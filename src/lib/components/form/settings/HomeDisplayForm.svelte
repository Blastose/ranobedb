<script lang="ts">
	import { addToast } from '$lib/components/toast/Toaster.svelte';
	import type { homeDisplaySettingsSchema } from '$lib/server/zod/schema';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import SubmitButton from '../SubmitButton.svelte';
	import CheckboxField from '../CheckboxField.svelte';

	export let homeDisplaySettingsForm: SuperValidated<Infer<typeof homeDisplaySettingsSchema>>;

	const sForm = superForm(homeDisplaySettingsForm, {
		dataType: 'json',
		invalidateAll: 'force',
	});
	const { form, enhance, delayed, submitting, message } = sForm;

	$: if (!$delayed && $message) {
		addToast({ data: { title: $message.text, type: $message.type } });
	}
</script>

<form method="post" action="?/homedisplaysettings" class="flex flex-col gap-2" use:enhance>
	<h3 class="text-lg font-bold">Home display preferences</h3>
	<div>
		<CheckboxField
			form={sForm}
			label="Show header"
			field="header"
			showRequiredSymbolIfRequired={false}
		/>
		<CheckboxField
			form={sForm}
			label="Show popular series"
			field="popular_series"
			showRequiredSymbolIfRequired={false}
		/>
		<CheckboxField
			form={sForm}
			label="Show reviews"
			field="reviews"
			showRequiredSymbolIfRequired={false}
		/>
		<CheckboxField
			form={sForm}
			label="Show upcoming releases"
			field="upcoming_releases"
			showRequiredSymbolIfRequired={false}
		/>
		<CheckboxField
			form={sForm}
			label="Show recently released"
			field="recently_released"
			showRequiredSymbolIfRequired={false}
		/>
		<CheckboxField
			form={sForm}
			label="Show seasonal anime"
			field="seasonal_anime"
			showRequiredSymbolIfRequired={false}
		/>
		<CheckboxField
			form={sForm}
			label="Show annoucements"
			field="annoucements"
			showRequiredSymbolIfRequired={false}
		/>
		<CheckboxField
			form={sForm}
			label="Show recent changes"
			field="recent_changes"
			showRequiredSymbolIfRequired={false}
		/>
	</div>

	<SubmitButton
		delayed={$delayed}
		submitting={$submitting}
		text={'Save home display preferences'}
	/>
</form>
