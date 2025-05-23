<script lang="ts">
	import { PUBLIC_IMAGE_URL } from '$env/static/public';
	import { createDialog, melt } from '@melt-ui/svelte';
	import Icon from '$lib/components/icon/Icon.svelte';
	import { fade, fly } from 'svelte/transition';
	import type { userListBookBatchSchema } from '$lib/server/zod/schema';
	import type { Infer, SuperValidated } from 'sveltekit-superforms';
	import { superForm } from 'sveltekit-superforms';
	import SubmitButton from '$lib/components/form/SubmitButton.svelte';
	import { tick } from 'svelte';
	import { addToast } from '$lib/components/toast/Toaster.svelte';
	import { defaultUserListLabelsArrayAndRemove } from '$lib/db/dbConsts';
	import TitleDisplay from '$lib/components/display/TitleDisplay.svelte';
	import type { Series } from '$lib/server/db/series/series';
	import SelectField from '$lib/components/form/SelectField.svelte';

	interface Props {
		series: Series;
		userListBookBatchForm: SuperValidated<Infer<typeof userListBookBatchSchema>>;
	}

	let { series, userListBookBatchForm }: Props = $props();

	const readingStatuses = defaultUserListLabelsArrayAndRemove.map((v) => {
		return { display: v, value: v };
	});

	const sForm = superForm(userListBookBatchForm, {
		dataType: 'json',
		onUpdated: async ({ form }) => {
			if (!form.valid) return;

			openNested.set(false);
			await tick();
			open.set(false);

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

	const {
		elements: { trigger, overlay, content, title, close, portalled },
		states: { open },
	} = createDialog({
		forceVisible: true,
		preventScroll: false,
	});

	const {
		elements: {
			trigger: triggerNested,
			overlay: overlayNested,
			content: contentNested,
			title: titleNested,
			description: descriptionNested,
			close: closeNested,
			portalled: portalledNested,
		},
		states: { open: openNested },
	} = createDialog({ forceVisible: true, preventScroll: false });

	const modalTitle = 'Batch edit books in series';
</script>

<div class="flex justify-center sm:justify-normal">
	<button use:melt={$trigger} class="link-box round-full w-full max-w-xs py-[0.375rem]"
		>Batch edit your books in series</button
	>
</div>

{#if $open}
	<div use:melt={$portalled}>
		<div use:melt={$overlay} class="modal-bg" transition:fade={{ duration: 150 }}></div>
		<div class="modal-content">
			<div
				transition:fly={{
					duration: 250,
					y: 8,
				}}
				use:melt={$content}
				class="modal-content-inner"
			>
				<div class="flex flex-col gap-2">
					<div class="flex flex-col">
						<h2 use:melt={$title} class="font-medium">{modalTitle}</h2>
						<h3 class="text-xl font-bold"><TitleDisplay obj={series} /></h3>
					</div>

					<form
						action="/api/i/user/series/{series.id}/batch"
						method="post"
						class="flex flex-col gap-4"
						use:enhance
					>
						<div class="flex flex-wrap gap-x-4 gap-y-2">
							<SelectField
								form={sForm}
								field="readingStatus"
								label="New reading status"
								dropdownOptions={readingStatuses}
								showRequiredSymbolIfRequired={false}
								selectedValue={$form.readingStatus}
								resetPadding={true}
								fit={true}
							/>
						</div>

						<div class="flex flex-col gap-1">
							<p>Select books</p>
							<div class="flex flex-col gap-2">
								<div class="flex flex-wrap gap-2">
									<button
										type="button"
										class="sub-btn"
										onclick={() => {
											$form.book_ids = series.books.map((v) => v.id);
										}}>Select all</button
									>
									<button
										type="button"
										class="sub-btn"
										onclick={() => {
											$form.book_ids = [];
										}}>Clear selection</button
									>
									<button
										type="button"
										class="sub-btn"
										onclick={() => {
											// TODO Slow for large arrays
											const newBookIds = [];
											for (const book of series.books) {
												if (!$form.book_ids.includes(book.id)) {
													newBookIds.push(book.id);
												}
											}
											$form.book_ids = newBookIds;
										}}>Invert selection</button
									>
								</div>
								<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-1">
									{#each series.books as book}
										{@const checked = $form.book_ids.includes(book.id)}
										<button
											class="book-select-item grid grid-cols-[48px_1fr] gap-2 p-2 rounded-md"
											class:clicked={checked}
											type="button"
											onclick={() => {
												console.log($form.book_ids);
												$form.book_ids.indexOf(book.id) >= 0
													? $form.book_ids.splice($form.book_ids.indexOf(book.id), 1)
													: $form.book_ids.push(book.id);
												$form.book_ids = $form.book_ids;
												console.log($form.book_ids);
											}}
										>
											{#if book.image}
												<span class="block relative">
													<img
														width={book?.image?.width}
														height={book?.image?.height}
														src="{PUBLIC_IMAGE_URL}{book?.image?.filename}"
														alt=""
														class="rounded-md object-cover"
														style="aspect-ratio: 0.70381231671554252199413489736072;"
														loading="lazy"
													/>
													{#if checked}
														<span class="absolute top-0 block">
															<Icon
																class="bg-[var(--primary-500)]"
																name="checkCircle"
																height="20"
																width="20"
															/>
														</span>
													{/if}
												</span>
											{:else}
												<span class="flex items-center justify-center h-full"
													><Icon name="book" height="24" width="24" /></span
												>
											{/if}
											<span class="block text-left">
												<p><TitleDisplay obj={book} /></p>
												<p>({book.label?.label ?? 'Not in list'})</p>
											</span>
										</button>
									{/each}
								</div>
							</div>
						</div>

						<div class="flex flex-col sm:flex-row justify-end gap-2">
							<button
								disabled={$submitting}
								type="button"
								use:melt={$triggerNested}
								class="primary-btn w-full">Batch edit</button
							>
						</div>
					</form>
				</div>

				<button use:melt={$close} aria-label="close" class="close-btn btn">
					<Icon name="close" />
				</button>

				{#if $openNested}
					<div use:melt={$portalledNested}>
						<div
							use:melt={$overlayNested}
							class="modal-bg"
							transition:fade={{ duration: 150 }}
						></div>
						<div class="modal-content">
							<div
								class="modal-content-inner confirm-modal"
								transition:fly={{
									duration: 250,
									y: 8,
								}}
								use:melt={$contentNested}
							>
								<h2 use:melt={$titleNested} class="text-lg font-medium">Confirm</h2>
								<p use:melt={$descriptionNested}>
									Are you sure you want to batch edit these books?
								</p>

								<form
									action="/api/i/user/series/{series.id}/batch"
									method="post"
									use:enhance
									class="mt-6 flex justify-end gap-2"
								>
									<button type="button" use:melt={$closeNested} class="btn btn-pad">Cancel</button>
									<button onclick={() => {}} type="submit" class="primary-btn">Confirm</button>
								</form>

								<button use:melt={$closeNested} aria-label="close" class="close-btn btn">
									<Icon name="close" />
								</button>
							</div>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-content-inner.confirm-modal {
		max-width: 512px;
	}

	.series-modal-volumes-read :global(input) {
		max-width: 72px;
	}

	.book-select-item {
		display: grid;
		gap: 0.5rem;
		padding: 0.25rem 0.5rem;
		transition: background-color 300ms;
		grid-template-columns: 48px 1fr;
	}

	.book-select-item:hover {
		background-color: var(--primary-300);
	}

	:global(.dark) .book-select-item:hover:not(.clicked) {
		background-color: var(--dark-400);
	}

	.book-select-item.clicked {
		background-color: var(--primary-500);
		color: var(--text-dark);
	}
</style>
