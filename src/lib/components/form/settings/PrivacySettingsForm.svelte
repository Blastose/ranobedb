<script lang="ts">
	import { addToast } from '$lib/components/toast/Toaster.svelte';
	import type { privacySettingsSchema } from '$lib/server/zod/schema';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import SubmitButton from '../SubmitButton.svelte';
	import CheckboxField from '../CheckboxField.svelte';

	export let privacySettingsForm: SuperValidated<Infer<typeof privacySettingsSchema>>;

	const sForm = superForm(privacySettingsForm, {
		dataType: 'json',
		invalidateAll: 'force',
	});
	const { form, enhance, delayed, submitting, message } = sForm;

	$: if (!$delayed && $message) {
		addToast({ data: { title: $message.text, type: $message.type } });
	}
</script>

<form method="post" action="?/privacysettings" class="flex flex-col gap-2" use:enhance>
	<h3 class="text-lg font-bold">Profile privacy</h3>
	<div class="flex flex-col gap-1">
		<CheckboxField
			form={sForm}
			label="Make my profile private"
			field="private"
			showRequiredSymbolIfRequired={false}
		/>
		<p class="sub-text-alt text-sm">
			When enabled, only you can view your profile and reading list. Your edit history and reviews
			will remain public.
		</p>
	</div>

	<SubmitButton delayed={$delayed} submitting={$submitting} text={'Save privacy settings'} />
</form>
