<script lang="ts">
	import type { usernameSchema } from '$lib/server/zod/schema';
	import SuperDebug, { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { addToast } from '$lib/components/toast/Toaster.svelte';
	import TextField from '../TextField.svelte';
	import SubmitButton from '../SubmitButton.svelte';
	import PasswordField from '../PasswordField.svelte';

	interface Props {
		usernameForm: SuperValidated<Infer<typeof usernameSchema>>;
	}

	let { usernameForm }: Props = $props();

	// svelte-ignore state_referenced_locally
	const sForm = superForm(usernameForm, {
		onUpdated({ form }) {
			addToast({
				data: {
					title: form.message?.text || 'An unknown error has occurred.',
					type: form.message?.type ?? 'error',
				},
			});
		},
		invalidateAll: 'force',
	});
	const { form, enhance, delayed, submitting, message } = sForm;
</script>

<!-- <SuperDebug data={$form} /> -->

<form method="post" action="?/username" class="flex flex-col gap-2" use:enhance>
	<h2 class="text-lg font-bold">Update username</h2>

	<div class="flex flex-col gap-1">
		<TextField form={sForm} field={'username'} placeholder="Username" label="New username" />
		<PasswordField
			form={sForm}
			field={'password'}
			placeholder="Password"
			label="Current password"
		/>
	</div>

	<SubmitButton delayed={$delayed} submitting={$submitting} text={'Update username'} />
</form>
