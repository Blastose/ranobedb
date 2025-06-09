<script lang="ts">
	import type { userListPublisherSchema } from '$lib/server/zod/schema';
	import type { Infer, SuperValidated } from 'sveltekit-superforms';
	import { superForm } from 'sveltekit-superforms';
	import SubmitButton from '$lib/components/form/SubmitButton.svelte';
	import { tick } from 'svelte';
	import { addToast } from '$lib/components/toast/Toaster.svelte';
	import type { Publisher } from '$lib/server/db/publishers/publishers';
	import HiddenInput from '../HiddenInput.svelte';

	interface Props {
		publisher: Publisher;
		userListPublisherForm: SuperValidated<Infer<typeof userListPublisherSchema>>;
	}

	let { publisher, userListPublisherForm: userListStaffForm }: Props = $props();

	const sForm = superForm(userListStaffForm, {
		dataType: 'json',
		onUpdated: async ({ form }) => {
			if (!form.valid) return;

			await tick();

			addToast({
				data: {
					title: form.message?.text ?? 'Success',
					type: 'success',
				},
			});
		},
		taintedMessage: null,
		invalidateAll: 'force',
	});

	const { form, enhance, delayed, submitting } = sForm;
</script>

<form
	action="/api/i/user/publisher/{publisher.id}"
	method="post"
	class="flex flex-col gap-4"
	use:enhance
>
	<HiddenInput name="type" value={$form.type}></HiddenInput>
	<div class="max-w-[10rem]">
		<SubmitButton
			delayed={$delayed}
			submitting={$submitting}
			text={$form.type === 'add' ? 'Favorite' : 'Favorited'}
		/>
	</div>
</form>
