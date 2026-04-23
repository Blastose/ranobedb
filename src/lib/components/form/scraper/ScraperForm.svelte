<script lang="ts">
	import BookEditionStaffInput from '$lib/components/form/book/BookEditionStaffInput.svelte';
	import CheckboxField from '$lib/components/form/CheckboxField.svelte';
	import LinkInput from '$lib/components/form/LinkInput.svelte';
	import ReleaseDateInput from '$lib/components/form/release/ReleaseDateInput.svelte';
	import SelectField from '$lib/components/form/SelectField.svelte';
	import SubmitButton from '$lib/components/form/SubmitButton.svelte';
	import TextareaFieldMarkdown from '$lib/components/form/TextareaFieldMarkdown.svelte';
	import TextField from '$lib/components/form/TextField.svelte';
	import Hr from '$lib/components/layout/Hr.svelte';
	import { addToast } from '$lib/components/toast/Toaster.svelte';
	import {
		languageNames,
		languagesArray,
		releaseFormatArray,
		releaseTypeArray,
		seriesStatusArray,
	} from '$lib/db/dbConsts';
	import type { scrapedBookDataSchema } from '$lib/server/zod/schema';
	import SuperDebug, { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import StaffNotInDbInput from './StaffNotInDbInput.svelte';
	import PublishersNotInDbInput from './PublishersNotInDbInput.svelte';
	import ReleasePublisherInput from '$lib/components/form/release/ReleasePublisherInput.svelte';
	import TitlesInput from '$lib/components/form/book/TitlesInput.svelte';

	export let addForm: SuperValidated<Infer<typeof scrapedBookDataSchema>>;

	const sForm = superForm(addForm, {
		dataType: 'json',
		onUpdate({ form: f }) {
			if (!f.valid) {
				addToast({ data: { title: f.message?.text || 'Error in form!', type: 'error' } });
			}
		},
		taintedMessage: true,
	});

	const { form, enhance, message, delayed, submitting, errors } = sForm;

	$: {
		if ($form.create_book === false) {
			$form.create_series = false;
		}
	}
</script>

<!-- <SuperDebug data={$form} /> -->

<form method="POST" class="flex flex-col gap-4" action="?/add_from_data" use:enhance>
	<p>
		Adding from <a href={$form.scraped_website_url} class="link" target="_blank"
			>{$form.scraped_website_url}</a
		>
	</p>
	<section>
		<h2 class="text-lg font-bold">Series data</h2>
		<CheckboxField
			form={sForm}
			field={'create_series'}
			label={$form.create_book
				? 'Create series'
				: 'Disabled; create book must be enabled to create series'}
			disabled={$form.create_book === false}
		/>
		{#if $form.create_series}
			<div class="flex flex-col gap-4">
				<TitlesInput form={sForm} field="series.series_titles" label="Series titles" />

				<SelectField
					form={sForm}
					field="series.publication_status"
					dropdownOptions={seriesStatusArray.map((item) => ({
						display: item,
						value: item,
					}))}
					selectedValue={$form.series.publication_status}
					label="Publication status"
					resetPadding={true}
					showRequiredSymbolIfRequired={false}
					fit={true}
				/>

				<div class="flex flex-wrap gap-x-4">
					<ReleaseDateInput form={sForm} field="series.start_date" label="Start date" />
					<ReleaseDateInput form={sForm} field="series.end_date" label="End date" />
				</div>
			</div>
		{/if}
	</section>

	<Hr />

	<section>
		<h2 class="text-xl font-bold">Book data</h2>

		<CheckboxField form={sForm} field={'create_book'} label="Create book" />
		{#if $form.create_book}
			<div class="flex flex-col gap-4">
				<TitlesInput form={sForm} field="titles" label="Book titles" />

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

				<section class="flex flex-col gap-1">
					<h3 class="font-bold">Database relations:</h3>
					<!-- We cast as any here because its hard to make the Component extendable -->
					<BookEditionStaffInput form={sForm as any} />
					<StaffNotInDbInput form={sForm} />
				</section>

				<section>
					<h3 class="font-bold">Cover image</h3>
					<div class="flex flex-col gap-2">
						<img src={$form.img_url} alt="" width="120" />
						<CheckboxField form={sForm} field={'use_img'} label="Use image" />
					</div>
				</section>
			</div>
		{/if}
	</section>

	<Hr />

	<section>
		<h2 class="text-xl font-bold">Release data</h2>

		<div class="flex flex-col gap-4">
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
					selectedValue={$form.lang}
					label="Language"
					showRequiredSymbolIfRequired={false}
					resetPadding={true}
					fit={true}
				/>
				<SelectField
					form={sForm}
					field="format"
					dropdownOptions={releaseFormatArray.map((item) => ({ display: item, value: item }))}
					selectedValue={$form.format}
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
				<TextField
					form={sForm}
					type="number"
					field="pages"
					label="Number of pages"
					placeholder="Pages"
					resetPadding={true}
				/>
			</div>

			<ReleaseDateInput form={sForm} field="release_date" label="Release date" />

			<SelectField
				form={sForm}
				field="book_rel_type"
				dropdownOptions={releaseTypeArray.map((item) => ({ display: item, value: item }))}
				selectedValue={$form.book_rel_type}
				label="Release type"
				showRequiredSymbolIfRequired={false}
				resetPadding={true}
				fit={true}
			/>

			<section>
				<h2 class="	font-bold">Links</h2>
				<div class="flex flex-col gap-2 max-w-md">
					<LinkInput form={sForm} field="website" label="Website" resetPadding={true} />

					<LinkInput form={sForm} field="amazon" label="Amazon" resetPadding={true} />

					<LinkInput form={sForm} field="bookwalker" label="Bookwalker" resetPadding={true} />

					<LinkInput form={sForm} field="rakuten" label="Rakuten" resetPadding={true} />
				</div>
			</section>

			<ReleasePublisherInput form={sForm} field="publishers" />

			<PublishersNotInDbInput form={sForm} />
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

	<SubmitButton delayed={$delayed} submitting={$submitting} text={'Add'} />
</form>
