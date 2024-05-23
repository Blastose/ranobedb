<script lang="ts">
	import { addToast } from '$lib/components/toast/Toaster.svelte';
	import { languageNames, type Language } from '$lib/db/dbTypes';
	import type { displayPrefsSchema } from '$lib/zod/schema';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import TitlePrefsInput from './TitlePrefsInput.svelte';

	export let displayPrefsForm: SuperValidated<Infer<typeof displayPrefsSchema>>;

	const sForm = superForm(displayPrefsForm, { dataType: 'json' });
	const { form, enhance, delayed, submitting, message } = sForm;

	$: if (!$delayed && $message) {
		addToast({ data: { title: $message.text, type: $message.type } });
	}

	console.log($form);
</script>

<form method="post" action="?/displayprefs" class="flex flex-col gap-2 max-w-lg" use:enhance>
	<div>
		<TitlePrefsInput form={sForm} />
	</div>

	<div>
		<h3 class="text-lg font-bold">Staff and publisher name language</h3>
		<select class="input" name="" id="">
			<option value="">Romaji</option>
		</select>
	</div>

	<button class="primary-btn">Save preferences</button>
</form>
