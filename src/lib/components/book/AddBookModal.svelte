<script lang="ts">
	import type { BookInfo } from '$lib/types/dbTypes';
	import { PUBLIC_IMAGE_URL } from '$env/static/public';
	import toast from '$lib/stores/toast';
	import FormButtonLoad from '$lib/components/form/FormButtonLoad.svelte';
	import { melt } from '@melt-ui/svelte';
	import type { Dialog } from '@melt-ui/svelte';
	import type { Writable } from 'svelte/store';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { Message, userBookSchema } from '$lib/zod/schemas2';
	import { superForm } from 'sveltekit-superforms/client';
	import FormInput from '$lib/components/form2/FormInput.svelte';
	import FormSelect from '$lib/components/form2/FormSelect.svelte';

	export let book: Pick<BookInfo, 'id' | 'title' | 'cover_image_file_name'>;
	export let meltTitle: Dialog['elements']['title'];
	export let open: Writable<boolean>;
	export let dataForm: SuperValidated<typeof userBookSchema, Message>;

	const supForm = superForm(dataForm, {
		onSubmit: () => {
			loading = newLoadingValue;
		},
		onUpdate: ({ form }) => {
			form.message;
			loading = null;
			if (!form.valid || (form.message && form.message.status === 'error')) {
				toast.set({
					icon: 'close',
					message: form.message?.text ?? 'An error has occurred',
					closeButton: false
				});
				return;
			}
			open.set(false);
			toast.set({
				icon: 'checkCircle',
				message: form.message?.text ?? 'Success',
				closeButton: false
			});
		}
	});
	const { enhance, form } = supForm;

	let labels: { label_name: string; label_id: number }[] = [
		{ label_name: 'Reading', label_id: 1 },
		{ label_name: 'Finished', label_id: 2 },
		{ label_name: 'Plan to read', label_id: 3 },
		{ label_name: 'Dropped', label_id: 4 },
		{ label_name: 'On hold', label_id: 5 }
	];

	const labelsForm = labels.map((v) => {
		return {
			displayText: v.label_name,
			value: v.label_name
		};
	});

	let newLoadingValue: 'add' | 'update' | 'remove' | null = null;
	let loading: 'add' | 'update' | 'remove' | null = null;
	let defaultStatusOption = $form.label ?? 'Reading';
</script>

<div class="flex flex-col gap-2">
	<p use:melt={$meltTitle} class="text-xl">Add book to reading list</p>
	<div class="layout">
		<p class="title">{book.title}</p>
		<img class="image" src="{PUBLIC_IMAGE_URL}/{book.cover_image_file_name}.jpg" alt="" />
		<form class="form" method="POST" action="/api/user/book/{book.id}" use:enhance>
			<div class="flex flex-col gap-1">
				<FormInput
					form={supForm}
					field="startDate"
					padding={false}
					showRequiredSymbolIfRequired={false}
					type="date"
					label="Start date"
				/>

				<FormInput
					form={supForm}
					field="finishDate"
					padding={false}
					showRequiredSymbolIfRequired={false}
					type="date"
					label="Finish date"
				/>

				<FormSelect
					form={supForm}
					field="label"
					padding={false}
					showRequiredSymbolIfRequired={false}
					label="Status"
					dropdownOptions={labelsForm}
					selectedValue={defaultStatusOption}
				/>
			</div>

			<div class="flex flex-col gap-2">
				{#if $form.inList}
					<FormButtonLoad
						name="type"
						text="Update"
						value="update"
						onClick={() => {
							newLoadingValue = 'update';
						}}
						loading={Boolean(loading)}
						showLoadingSpinner={loading === 'update'}
					/>
					<FormButtonLoad
						name="type"
						text="Remove"
						value="remove"
						altColor={true}
						onClick={(e) => {
							if (!confirm('Are you sure you want to remove this book from your reading list?')) {
								e.preventDefault();
							} else {
								newLoadingValue = 'remove';
							}
						}}
						loading={Boolean(loading)}
						showLoadingSpinner={loading === 'remove'}
					/>
				{:else}
					<FormButtonLoad
						name="type"
						text="Add"
						value="add"
						onClick={() => {
							newLoadingValue = 'add';
						}}
						loading={Boolean(loading)}
						showLoadingSpinner={loading === 'add'}
					/>
				{/if}
			</div>
		</form>
	</div>
</div>

<style>
	.image {
		grid-area: image;
		border-radius: 0.125rem;
	}

	.title {
		grid-area: title;
		font-weight: 600;
	}

	.form {
		grid-area: form;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.input {
		background-color: rgb(226 232 240);
		border-radius: 0.375rem;
		padding: 0.5rem;
	}

	:global(.dark) .input {
		background-color: var(--dark-500);
	}

	.layout {
		display: grid;
		grid-template-areas:
			'image title'
			'form form';
		grid-template-columns: 25% 1fr;
		grid-template-rows: min-content 1fr;
		column-gap: 1rem;
		row-gap: 1rem;
	}

	@media (min-width: 768px) {
		.layout {
			grid-template-areas:
				'image title'
				'image form';
			grid-template-columns: 35% 1fr;
			grid-template-rows: min-content 1fr;
		}
	}
</style>
