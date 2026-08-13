<script lang="ts">
	import type { releaseSchema } from '$lib/server/zod/schema';
	import SuperDebug, { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import TextField from '../TextField.svelte';
	import SubmitButton from '$lib/components/form/SubmitButton.svelte';
	import Hr from '$lib/components/layout/Hr.svelte';
	import { addToast } from '$lib/components/toast/Toaster.svelte';
	import VisibilityInputs from '../all/VisibilityInputs.svelte';
	import { hasVisibilityPerms } from '$lib/db/permissions';
	import type { User } from '$lib/server/lucia/lucia';
	import type { ReleaseEdit } from '$lib/server/db/releases/releases';
	import ReleasePublisherInput from './ReleasePublisherInput.svelte';
	import ReleaseBookInput from './ReleaseBookInput.svelte';
	import ReleaseDateInput from './ReleaseDateInput.svelte';
	import { formFieldProxy } from 'sveltekit-superforms';
	import { languageNames, languagesArray, releaseFormatArray } from '$lib/db/dbConsts';
	import SelectField from '../SelectField.svelte';
	import NameDisplay from '$lib/components/display/NameDisplay.svelte';
	import TextareaFieldMarkdown from '../TextareaFieldMarkdown.svelte';
	import LinkInput from '../LinkInput.svelte';

	export let release: ReleaseEdit | undefined;
	export let releaseForm: SuperValidated<Infer<typeof releaseSchema>>;
	export let type: 'add' | 'edit';
	export let user: User | null;
	export let actionUrl: string | undefined = undefined;

	const sForm = superForm(releaseForm, {
		dataType: 'json',
		onUpdated({ form: f }) {
			if (!f.valid) {
				addToast({ data: { title: f.message?.text || 'Error in form!', type: 'error' } });
			}
		},
		taintedMessage: true,
	});
	const { form, enhance, delayed, submitting } = sForm;
	const { errors: durationErrors } = formFieldProxy(sForm, 'duration');

	$: submitButtonText = type === 'add' ? 'Submit' : 'Submit edit';

	function onDurationHoursInput(e: Event) {
		const hours = parseInt((e.target as HTMLInputElement).value) || 0;
		const mins = $form.duration ? $form.duration % 60 : 0;
		$form.duration = hours * 60 + mins || null;
	}

	function onDurationMinutesInput(e: Event) {
		const mins = parseInt((e.target as HTMLInputElement).value) || 0;
		const hours = $form.duration ? Math.floor($form.duration / 60) : 0;
		$form.duration = hours * 60 + mins || null;
	}
</script>

<!-- <SuperDebug data={$form} /> -->

<form method="post" class="flex flex-col gap-4" action={actionUrl} use:enhance>
	{#if release && type === 'edit'}
		<h1 class="text-xl font-bold">Editing <NameDisplay obj={release} /></h1>
	{:else}
		<h1 class="text-xl font-bold">Add release</h1>
	{/if}

	{#if user && hasVisibilityPerms(user)}
		<VisibilityInputs form={sForm} />
	{/if}

	<TextField form={sForm} type="text" field="title" label="Title" placeholder="Title" />
	<TextField
		form={sForm}
		type="text"
		field="romaji"
		label="Romanization"
		placeholder="Romanization"
	/>

	<div class="flex gap-4">
		<SelectField
			form={sForm}
			field="lang"
			dropdownOptions={languagesArray.map((item) => ({
				display: languageNames[item],
				value: item,
			}))}
			selectedValue={releaseForm.data.lang}
			label="Language"
			showRequiredSymbolIfRequired={false}
			resetPadding={true}
			fit={true}
		/>
		<SelectField
			form={sForm}
			field="format"
			dropdownOptions={releaseFormatArray.map((item) => ({ display: item, value: item }))}
			selectedValue={releaseForm.data.format}
			label="Format"
			showRequiredSymbolIfRequired={false}
			resetPadding={true}
			fit={true}
		/>
	</div>

	<div class="flex flex-wrap gap-x-4">
		<TextField
			form={sForm}
			type="text"
			field="isbn13"
			label="ISBN 13"
			placeholder="ISBN 13"
			resetPadding={true}
		/>
		{#if $form.format === 'digital' || $form.format === 'print'}
			<TextField
				form={sForm}
				type="number"
				field="pages"
				label="Number of pages"
				placeholder="Pages"
				resetPadding={true}
			/>
		{/if}
	</div>

	{#if $form.format === 'audio'}
		<section>
			<p>Duration</p>

			<div class="flex gap-2">
				<label class="flex max-w-24 flex-col gap-1">
					<span>Hours</span>
					<input
						type="number"
						placeholder="hrs"
						class="input reset-padding"
						min={0}
						value={$form.duration ? Math.floor($form.duration / 60) : ''}
						oninput={onDurationHoursInput}
					/>
				</label>
				<label class="flex max-w-20 flex-col gap-1">
					<span>Minutes</span>
					<input
						type="number"
						placeholder="min"
						class="input reset-padding"
						min={0}
						value={$form.duration ? $form.duration % 60 : ''}
						oninput={onDurationMinutesInput}
					/>
				</label>
			</div>
			{#if $durationErrors?.length}
				<span class="error-text-color">{$durationErrors.join(', ')}</span>
			{/if}
		</section>
	{/if}

	<ReleaseDateInput form={sForm} field="release_date" label="Release date" />

	<section>
		<h2 class="text-lg font-bold">Links</h2>
		<div class="flex max-w-md flex-col gap-2">
			<LinkInput form={sForm} field="website" label="Website" resetPadding={true} />

			<LinkInput form={sForm} field="amazon" label="Amazon" resetPadding={true} />

			<LinkInput form={sForm} field="bookwalker" label="BookWalker" resetPadding={true} />

			<LinkInput form={sForm} field="rakuten" label="Rakuten" resetPadding={true} />
		</div>
	</section>

	<TextareaFieldMarkdown
		form={sForm}
		type="textarea"
		field="description"
		label="Note"
		textareaRows={4}
		placeholder="Note"
		labelId="description"
	/>

	<Hr />

	<ReleaseBookInput form={sForm} />
	<ReleasePublisherInput form={sForm} field="publishers" />

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
