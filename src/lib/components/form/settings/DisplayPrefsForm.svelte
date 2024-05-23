<script lang="ts">
	import { addToast } from '$lib/components/toast/Toaster.svelte';
	import { languageNames, type Language } from '$lib/db/dbTypes';
	import type { displayPrefsSchema } from '$lib/zod/schema';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import TitlePrefsInput from './TitlePrefsInput.svelte';
	import SelectField from '../SelectField.svelte';

	export let displayPrefsForm: SuperValidated<Infer<typeof displayPrefsSchema>>;

	const sForm = superForm(displayPrefsForm, { dataType: 'json', invalidateAll: 'force' });
	const { form, enhance, delayed, submitting, message } = sForm;

	$: if (!$delayed && $message) {
		addToast({ data: { title: $message.text, type: $message.type } });
	}

	console.log($form);
</script>

<form method="post" action="?/displayprefs" class="flex flex-col gap-4 max-w-lg" use:enhance>
	<div>
		<TitlePrefsInput form={sForm} />
	</div>

	<div>
		<h3 class="text-lg font-bold">Staff and publisher names</h3>
		<div class="w-fit">
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
			/>
		</div>
	</div>

	<button type="submit" class="primary-btn">Save preferences</button>
</form>
