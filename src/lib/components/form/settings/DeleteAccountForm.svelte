<script lang="ts">
	import type { deleteAccountSchema } from '$lib/server/zod/schema';
	import SuperDebug, { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { addToast } from '$lib/components/toast/Toaster.svelte';
	import SubmitButton from '../SubmitButton.svelte';
	import PasswordField from '../PasswordField.svelte';
	import TextField from '../TextField.svelte';
	import { accountDeletionPhrase } from '$lib/db/dbConsts';

	interface Props {
		deleteAccountForm: SuperValidated<Infer<typeof deleteAccountSchema>>;
	}

	let { deleteAccountForm }: Props = $props();

	// svelte-ignore state_referenced_locally
	const sForm = superForm(deleteAccountForm, {
		onUpdated({ form }) {
			if (form.message)
				addToast({
					data: {
						title: form.message?.text || 'An error has occurred.',
						type: form.message?.type ?? 'error',
					},
				});
		},
		invalidateAll: true,
	});
	const { form, enhance, delayed, submitting, message } = sForm;
</script>

<!-- <SuperDebug data={$form} /> -->

<form method="post" action="?/delete_account" class="flex max-w-lg flex-col gap-2" use:enhance>
	<div>
		<h2 class="text-lg font-bold">Delete account</h2>
		<p class="text-sm">
			Warning: This action is permanent and will take effect immediately.
			<br />
			By deleting your account, you will lose access to all your data, including user lists, reviews,
			etc. <br />
			Your contributions to the database will remain public but will be anonymized and attributed to [Deleted
			Users].
			<br />
			This action CANNOT be undone. We cannot recover your account once it is deleted.
			<br />
			To confirm account deletion, type your current password and the account deletion confirmation phrase
			below.
		</p>
	</div>

	<div class="flex flex-col gap-1">
		<PasswordField
			form={sForm}
			field={'password'}
			placeholder="Password"
			label="Current password"
		/>
		<TextField
			form={sForm}
			field={'confirmationPhrase'}
			placeholder="Confirm deletion"
			autocomplete="off"
			label={`To confirm account deletion, type "${accountDeletionPhrase}" exactly in the box below`}
		/>
	</div>

	<SubmitButton delayed={$delayed} submitting={$submitting} text={'Delete account'} />
</form>
