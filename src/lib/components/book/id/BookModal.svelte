<script lang="ts">
	import { createDialog, melt } from '@melt-ui/svelte';
	import Icon from '$lib/components/icon/Icon.svelte';
	import { fade, fly } from 'svelte/transition';
	import type { BookR } from '$lib/server/db/books/books';
	import type { userListBookSchema } from '$lib/zod/schema';
	import type { SuperValidated } from 'sveltekit-superforms';
	import { superForm } from 'sveltekit-superforms/client';
	import TextField from '$lib/components/form/TextField.svelte';
	import SubmitButton from '$lib/components/form/SubmitButton.svelte';
	import { tick } from 'svelte';

	export let book: BookR;
	export let form: SuperValidated<typeof userListBookSchema>;

	$: form2 = superForm(form, {
		dataType: 'json',
		onUpdate: async ({ form }) => {
			if (!form.valid) return;

			openNested.set(false);
			await tick();
			open.set(false);
			// Send toast;
		}
	});

	$: ({ form: form3, errors, enhance, delayed, submitting } = form2);

	const {
		elements: { trigger, overlay, content, title, description, close, portalled },
		states: { open }
	} = createDialog({
		forceVisible: true,
		preventScroll: false
	});

	const {
		elements: {
			trigger: triggerNested,
			overlay: overlayNested,
			content: contentNested,
			title: titleNested,
			description: descriptionNested,
			close: closeNested,
			portalled: portalledNested
		},
		states: { open: openNested }
	} = createDialog({ forceVisible: true, preventScroll: false });

	$: currentTheme = `background-image: linear-gradient(rgba(242, 242, 242, 0.25) 0%, rgba(242, 242, 242, 1) 75%, rgba(242, 242, 242, 1) 100%), url(/covers_temp/${book.filename}.jpg);`;
</script>

<button use:melt={$trigger} class="rounded-md px-2 py-1 bg-[var(--primary-500)]">Modal</button>

<div use:melt={$portalled}>
	{#if $open}
		<div use:melt={$overlay} class="modal-bg" transition:fade={{ duration: 150 }} />
		<div
			class="modal-content"
			transition:fly={{
				duration: 250,
				y: 8
			}}
			use:melt={$content}
		>
			<div class="flex flex-col gap-2">
				<div class="flex flex-col">
					<h2 use:melt={$title} class="font-medium">Add book to reading list</h2>
					<h3 class="text-xl font-bold">{book.title}</h3>
				</div>
				<!-- 
				<img
					width="240"
					height="360"
					class="img max-w-[50px] h-fit rounded-sm shadow-sm"
					src="/covers_temp/{book.filename}.jpg"
					alt=""
				/> -->

				<form
					action="/api/i/user/book/{book.id}"
					method="post"
					class="flex flex-col gap-4"
					use:enhance
				>
					<div class="flex flex-col gap-2">
						<TextField form={form2} type="date" field="started" label="Started" />
						<TextField form={form2} type="date" field="finished" label="Finished" />
						<TextField
							form={form2}
							type="number"
							field="score"
							label="Score"
							placeholder="Score (between 1 and 10)"
						/>
						<TextField form={form2} type="textarea" field="notes" label="Notes" textareaRows={2} />
					</div>

					<div class="flex flex-col sm:flex-row gap-2">
						<SubmitButton
							value={$form3.type}
							text="Save"
							delayed={$delayed && !$openNested}
							submitting={$submitting && !$openNested}
						/>
						{#if $form3.type === 'update'}
							<button
								type="button"
								use:melt={$triggerNested}
								disabled={$submitting}
								class="whitespace-nowrap btn px-4 py-2 rounded-md">Remove from list</button
							>
						{/if}
					</div>
				</form>
				<button use:melt={$close} aria-label="close" class="close-btn btn">
					<Icon name="close" />
				</button>
			</div>

			<div use:melt={$portalledNested}>
				{#if $openNested}
					<div use:melt={$overlayNested} class="modal-bg" transition:fade={{ duration: 150 }} />
					<div
						class="modal-content confirm-modal"
						transition:fly={{
							duration: 250,
							y: 8
						}}
						use:melt={$contentNested}
					>
						<h2 use:melt={$titleNested} class="text-lg font-medium">Warning</h2>
						<p use:melt={$descriptionNested}>
							Are you sure you want to remove this book from your list?
						</p>

						<form
							action="/api/i/user/book/{book.id}"
							method="post"
							use:enhance
							class="mt-6 flex justify-end gap-2"
						>
							<button
								disabled={$submitting}
								type="button"
								use:melt={$closeNested}
								class="btn px-4 py-2 rounded-md">Cancel</button
							>
							<button
								disabled={$submitting}
								on:click={() => {
									$form3.type = 'delete';
								}}
								type="submit"
								class="text-white px-4 py-2 rounded-md bg-[var(--primary-500)]"
							>
								Delete
							</button>
						</form>

						<button use:melt={$closeNested} aria-label="close" class="close-btn btn">
							<Icon name="close" />
						</button>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.confirm-modal {
		max-width: 512px;
		max-height: 200px;
	}
</style>
