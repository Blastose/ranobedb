<script lang="ts">
	import type { bookSchema } from '$lib/server/zod/schema';
	import SuperDebug, {
		fileProxy,
		superForm,
		type Infer,
		type SuperValidated,
	} from 'sveltekit-superforms';
	import SubmitButton from '$lib/components/form/SubmitButton.svelte';
	import BookTitlesInput from './BookTitlesInput.svelte';
	import type { BookEdit } from '$lib/server/db/books/books';
	import Hr from '$lib/components/layout/Hr.svelte';
	import { addToast } from '$lib/components/toast/Toaster.svelte';
	import VisibilityInputs from '../all/VisibilityInputs.svelte';
	import { hasVisibilityPerms } from '$lib/db/permissions';
	import type { User } from '$lib/server/lucia/lucia';
	import BookEditionStaffInput from './BookEditionStaffInput.svelte';
	import TextareaFieldMarkdown from '../TextareaFieldMarkdown.svelte';
	import { languageNames, languagesArray } from '$lib/db/dbConsts';
	import SelectField from '../SelectField.svelte';
	import { buildImageUrl } from '$lib/components/book/book';
	import TextField from '../TextField.svelte';

	export let book: BookEdit | undefined;
	export let bookForm: SuperValidated<Infer<typeof bookSchema>>;
	export let type: 'add' | 'edit';
	export let user: User | null;
	export let actionUrl: string | undefined = undefined;

	const sForm = superForm(bookForm, {
		dataType: 'json',
		onUpdated({ form: f }) {
			if (!f.valid) {
				addToast({ data: { title: f.message?.text || 'Error in form!', type: 'error' } });
			}
		},
	});
	const { form, enhance, delayed, submitting, errors } = sForm;

	$: submitButtonText = type === 'add' ? 'Submit' : 'Submit edit';

	const file = fileProxy(form, 'image');

	function clearFileInput() {
		const el = document.querySelector("input[type='file']") as HTMLInputElement | null;
		if (el) {
			el.value = '';
		}
	}
</script>

<!-- <SuperDebug data={$form} /> -->

<form
	method="post"
	class="flex flex-col gap-4"
	enctype="multipart/form-data"
	action={actionUrl}
	use:enhance
>
	{#if book && type === 'edit'}
		<h1 class="font-bold text-xl">Editing {book.title ?? book.title_orig ?? 'book'}</h1>
	{:else}
		<h1 class="font-bold text-xl">Add book</h1>
	{/if}

	{#if user && hasVisibilityPerms(user)}
		<VisibilityInputs form={sForm} />
	{/if}

	<BookTitlesInput form={sForm} />

	<Hr />

	<TextareaFieldMarkdown
		form={sForm}
		type="textarea"
		field="description"
		label="Description"
		textareaRows={4}
		placeholder="Description"
		labelId="description-md"
	/>

	<TextareaFieldMarkdown
		form={sForm}
		type="textarea"
		field="description_ja"
		label="Description (Japanese)"
		textareaRows={4}
		placeholder="Description (Japanese)"
		labelId="descriptionjp-md"
	/>

	<SelectField
		form={sForm}
		field="olang"
		dropdownOptions={languagesArray.map((item) => ({
			display: languageNames[item],
			value: item,
		}))}
		selectedValue={bookForm.data.olang}
		label="Language"
		showRequiredSymbolIfRequired={false}
		resetPadding={true}
		fit={true}
	/>

	<Hr />

	<section>
		<p class="font-bold text-xl">Database relations:</p>
		<BookEditionStaffInput form={sForm} />
	</section>

	<Hr />

	<section class="flex flex-col gap-2">
		<div>
			<h2 class="font-bold text-xl">Cover image</h2>
			{#if book?.image_obj}
				<p>Current image</p>
				<p>Image ID: {book.image_obj.filename?.replace('.jpg', '')}</p>
				<div class="max-w-36">
					<img src={buildImageUrl(book.image_obj.filename)} alt="" />
				</div>
			{:else}
				<p>Currently no cover image for this book</p>
			{/if}
		</div>

		<div>
			<label class="flex flex-col gap-1">
				<span>Upload new image (JPEG, PNG, WEBP; max 10MB)</span>
				<input
					type="file"
					name="image"
					accept="image/png, image/jpeg, image/webp"
					bind:files={$file}
					disabled={Boolean($form.image_id_manual)}
				/>
			</label>
			{#if $file && $file.item && $file.item(0)}
				<p>New image preview</p>
				<div class="flex gap-2">
					<div class="max-w-36">
						<img src={URL.createObjectURL($file.item(0) ?? new Blob())} alt="" />
					</div>
					<button
						class="sub-btn h-fit"
						type="button"
						on:click={() => {
							$file = new DataTransfer().files;
							clearFileInput();
						}}>Remove uploaded file</button
					>
				</div>
			{/if}

			{#if $errors.image}<span class="error-text-color">{$errors.image}</span>{/if}

			{#if !Boolean($file && $file.item && $file.item(0))}
				<p>or</p>

				<div class="w-fit">
					<TextField
						form={sForm}
						type="text"
						field="image_id_manual"
						label="Use exisiting image from image ID"
						disabled={Boolean($file && $file.item && $file.item(0))}
						resetPadding={true}
					/>
				</div>

				{#if $form.image_id_manual}
					<p>Image</p>
					<div class="max-w-36">
						<img src={buildImageUrl(`${$form.image_id_manual}.jpg`)} alt="" />
					</div>
				{/if}
			{/if}
		</div>
	</section>

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
