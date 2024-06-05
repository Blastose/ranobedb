<script lang="ts">
	import type { publisherSchema } from '$lib/server/zod/schema';
	import SuperDebug, { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import TextField from '../TextField.svelte';
	import SubmitButton from '$lib/components/form/SubmitButton.svelte';
	import Hr from '$lib/components/layout/Hr.svelte';
	import { addToast } from '$lib/components/toast/Toaster.svelte';
	import VisibilityInputs from '../all/VisibilityInputs.svelte';
	import { hasVisibilityPerms } from '$lib/db/permissions';
	import type { User } from 'lucia';
	import type { PublisherEdit } from '$lib/server/db/publishers/publishers';
	import PublisherRelInput from './PublisherRelInput.svelte';
	import NameDisplay from '$lib/components/display/NameDisplay.svelte';
	import TextareaFieldMarkdown from '../TextareaFieldMarkdown.svelte';
	import TextFieldLink from '../TextFieldLink.svelte';
	import LinkInput from '../LinkInput.svelte';
	import {
		bookwalkerAuthorLink,
		twitterLink,
		wikidataLink,
	} from '$lib/components/db-links/db-ext-links';

	export let publisher: PublisherEdit | undefined;
	export let publisherForm: SuperValidated<Infer<typeof publisherSchema>>;
	export let type: 'add' | 'edit';
	export let user: User | null;

	const sForm = superForm(publisherForm, {
		dataType: 'json',
		resetForm: false,
		onUpdated({ form: f }) {
			if (!f.valid) {
				addToast({ data: { title: 'Error in form!', type: 'error' } });
			}
		},
	});
	const { form, enhance, delayed, submitting } = sForm;

	$: submitButtonText = type === 'add' ? 'Submit' : 'Submit edit';
</script>

<!-- <SuperDebug data={$form} /> -->

<form method="post" class="flex flex-col gap-4" use:enhance>
	{#if publisher}
		<h1 class="font-bold text-xl">
			Editing <NameDisplay obj={publisher} fallback={'publisher'} />
		</h1>
	{:else}
		<h1 class="font-bold text-xl">Add publisher</h1>
	{/if}

	{#if user && hasVisibilityPerms(user)}
		<VisibilityInputs form={sForm} />
	{/if}

	<TextField form={sForm} type="text" field="name" label="Name" placeholder="Name" />
	<TextField
		form={sForm}
		type="text"
		field="romaji"
		label="Romanization"
		placeholder="Romanization"
	/>

	<section>
		<h2 class="text-lg font-bold">Links</h2>
		<div class="flex flex-col gap-2">
			<div class="max-w-md">
				<LinkInput form={sForm} field="website" label="Website" resetPadding={true} />
			</div>
			<TextFieldLink
				form={sForm}
				type="number"
				field="bookwalker_id"
				label="Bookwalker"
				resetPadding={true}
				linkBeforeAfter={bookwalkerAuthorLink}
			/>
			<TextFieldLink
				form={sForm}
				type="number"
				field="wikidata_id"
				label="Wikidata"
				resetPadding={true}
				linkBeforeAfter={wikidataLink}
			/>
			<TextFieldLink
				form={sForm}
				type="text"
				field="twitter_id"
				label="Twitter"
				resetPadding={true}
				linkBeforeAfter={twitterLink}
			/>
		</div>
	</section>

	<TextareaFieldMarkdown
		form={sForm}
		type="textarea"
		field="description"
		label="Biography"
		textareaRows={4}
		placeholder="Biography"
		labelId="biography-md"
	/>

	<PublisherRelInput form={sForm} />

	<Hr />

	<TextareaFieldMarkdown
		form={sForm}
		type="textarea"
		field="comment"
		label="Edit summary"
		textareaRows={4}
		placeholder="Summarize the changes you have made"
		labelId="edit-summary"
	/>

	<SubmitButton delayed={$delayed} submitting={$submitting} text={submitButtonText} />
</form>
