<script lang="ts">
	import type { staffSchema } from '$lib/server/zod/schema';
	import SuperDebug, { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import SubmitButton from '$lib/components/form/SubmitButton.svelte';
	import Hr from '$lib/components/layout/Hr.svelte';
	import { addToast } from '$lib/components/toast/Toaster.svelte';
	import VisibilityInputs from '../all/VisibilityInputs.svelte';
	import { hasVisibilityPerms } from '$lib/db/permissions';
	import type { User } from '$lib/server/lucia/lucia';
	import type { StaffEdit } from '$lib/server/db/staff/staff';
	import StaffNamesInput from './StaffNamesInput.svelte';
	import NameDisplay from '$lib/components/display/NameDisplay.svelte';
	import TextareaFieldMarkdown from '../TextareaFieldMarkdown.svelte';
	import TextFieldLink from '../TextFieldLink.svelte';
	import {
		bookwalkerAuthorLink,
		bskyLink,
		kakuyomuLink,
		pixivLink,
		syosetuLink,
		twitterLink,
		wikidataLink,
	} from '$lib/components/db-links/db-ext-links';
	import LinkInput from '../LinkInput.svelte';

	export let staff: StaffEdit | undefined;
	export let staffForm: SuperValidated<Infer<typeof staffSchema>>;
	export let type: 'add' | 'edit';
	export let user: User | null;
	export let actionUrl: string | undefined = undefined;

	const sForm = superForm(staffForm, {
		dataType: 'json',
		onUpdated({ form: f }) {
			if (!f.valid) {
				addToast({ data: { title: f.message?.text || 'Error in form!', type: 'error' } });
			}
		},
	});
	const { form, enhance, delayed, submitting } = sForm;

	$: submitButtonText = type === 'add' ? 'Submit' : 'Submit edit';
</script>

<!-- <SuperDebug data={$form} /> -->

<form method="post" class="flex flex-col gap-4" action={actionUrl} use:enhance>
	{#if staff && type === 'edit'}
		<h1 class="font-bold text-xl">
			Editing <NameDisplay obj={staff} fallback="staff" />
		</h1>
	{:else}
		<h1 class="font-bold text-xl">Add staff</h1>
	{/if}

	{#if user && hasVisibilityPerms(user)}
		<VisibilityInputs form={sForm} />
	{/if}

	<StaffNamesInput form={sForm} />

	<Hr />

	<section>
		<h2 class="text-lg font-bold">Links</h2>
		<div class="flex flex-col gap-2">
			<div class="max-w-md">
				<LinkInput form={sForm} field="website" label="Website" resetPadding={true} />
			</div>
			<TextFieldLink
				form={sForm}
				type="number"
				field="syosetu_id"
				label="Syosetu"
				resetPadding={true}
				linkBeforeAfter={syosetuLink}
			/>
			<TextFieldLink
				form={sForm}
				type="text"
				field="kakuyomu_id"
				label="Kakuyomu"
				resetPadding={true}
				linkBeforeAfter={kakuyomuLink}
			/>
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
			<TextFieldLink
				form={sForm}
				type="text"
				field="bsky_id"
				label="Bluesky"
				resetPadding={true}
				linkBeforeAfter={bskyLink}
			/>
			<TextFieldLink
				form={sForm}
				type="number"
				field="pixiv_id"
				label="Pixiv"
				resetPadding={true}
				linkBeforeAfter={pixivLink}
			/>
		</div>
	</section>

	<Hr />

	<TextareaFieldMarkdown
		form={sForm}
		type="textarea"
		field="description"
		label="Biography"
		textareaRows={4}
		placeholder="Biography"
		labelId="description"
	/>

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
