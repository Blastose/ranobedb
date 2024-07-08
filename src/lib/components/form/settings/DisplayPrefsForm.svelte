<script lang="ts">
	import { addToast } from '$lib/components/toast/Toaster.svelte';
	import type { displayPrefsSchema } from '$lib/server/zod/schema';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import TitlePrefsInput from './TitlePrefsInput.svelte';
	import SelectField from '../SelectField.svelte';
	import SubmitButton from '../SubmitButton.svelte';

	export let displayPrefsForm: SuperValidated<Infer<typeof displayPrefsSchema>>;

	const sForm = superForm(displayPrefsForm, { dataType: 'json', invalidateAll: 'force' });
	const { form, enhance, delayed, submitting, message } = sForm;

	$: if (!$delayed && $message) {
		addToast({ data: { title: $message.text, type: $message.type } });
	}
</script>

<form method="post" action="?/displayprefs" class="flex flex-col gap-4" use:enhance>
	<div>
		<TitlePrefsInput form={sForm} />
	</div>

	<div>
		<h3 class="text-lg font-bold">Release titles, staff and publisher names</h3>
		<SelectField
			form={sForm}
			dropdownOptions={[
				{ display: 'Romaji (e.g. Kawahara Reki, Dengeki Bunko)', value: 'romaji' },
				{ display: 'Native (e.g. 川原礫, 電撃文庫)', value: 'native' },
			]}
			field="names"
			label="Display name"
			selectedValue={$form.names}
			resetPadding={true}
			showRequiredSymbolIfRequired={false}
			fit={true}
		/>
	</div>
	<div>
		<h3 class="text-lg font-bold">Book descriptions</h3>
		<p class="text-sm">
			If a book does not have an English description, it will display the Japanese description if it
			has one.
		</p>

		<SelectField
			form={sForm}
			dropdownOptions={[
				{ display: 'English', value: 'en' },
				{ display: 'Japanese', value: 'ja' },
			]}
			field="descriptions"
			label="Descriptions"
			selectedValue={$form.descriptions}
			resetPadding={true}
			showRequiredSymbolIfRequired={false}
			fit={true}
		/>
	</div>

	<SubmitButton delayed={$delayed} submitting={$submitting} text={'Save preferences'} />
</form>
