<script lang="ts">
	import type { ActionData, PageData } from './$types';

	import Form from '$lib/components/form/Form.svelte';
	import FormInput from '$lib/components/form/FormInput.svelte';
	import FormTextArea from '$lib/components/form/FormTextArea.svelte';
	import FormSubmitButton from '$lib/components/form/FormSubmitButton.svelte';
	import Alert from '$lib/components/alert/Alert.svelte';

	export let form: ActionData;
	export let data: PageData;
	let loading: boolean;
	let title = data.book.title;
	let titleRomaji = data.book.title_romaji;
	let description = data.book.description_markdown;
	let volume = data.book.volume;
</script>

<svelte:head>
	<title>Edit {data.book.title} - RanobeDB</title>
</svelte:head>

<main class="main-container flex flex-col gap-4">
	<div class="flex">
		<button
			on:click={() => {
				history.back();
			}}>Back</button
		>
	</div>
	<h1 class="font-bold text-2xl">Edit</h1>

	{#if form?.success && !loading}
		<Alert type="success">Edited entry successfully!</Alert>
	{:else if form?.error && !loading}
		<Alert type="error">An error has occurred.</Alert>
	{/if}

	<Form bind:loading reset={false}>
		<div slot="form-input" class="flex flex-col gap-2">
			<h2 class="font-bold text-xl">Book</h2>

			<FormInput
				bind:value={title}
				name="title"
				id="title"
				type="text"
				labelName="Title"
				required={true}
				placeholder="Title"
			/>

			<FormInput
				bind:value={titleRomaji}
				name="titleRomaji"
				id="titleRomaji"
				type="text"
				labelName="Title Romaji"
				required={true}
				placeholder="Title Romaji"
			/>

			<FormTextArea
				bind:value={description}
				name="description"
				id="description"
				labelName="Description"
				required={false}
				rows={12}
			/>

			<FormInput
				bind:value={volume}
				name="volume"
				id="volume"
				type="text"
				labelName="Volume"
				required={true}
				placeholder="Volume"
			/>

			<!-- <div>
				<h2 class="font-bold text-xl">Database Relations</h2>
				<div class="flex flex-col gap-2 items-start">
					<h3 class="font-semibold text-lg">Authors</h3>
					<div>
						{#each data.book.authors as author}
							<input checked type="checkbox" name="author{author.id}" id="author{author.id}" />
							<label for="author{author.id}">{author.name}</label>
						{/each}
					</div>
					<button class="bg-primary-500 text-white px-2 py-1 rounded-md" type="button"
						>Add Author</button
					>
				</div>
			</div> -->
		</div>

		<div slot="form-submit">
			<FormSubmitButton {loading} text={'Submit Edit'} />
		</div>
	</Form>
</main>
