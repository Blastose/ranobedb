<script lang="ts">
	import { addToast } from '$lib/components/toast/Toaster.svelte';
	import type { BookR } from '$lib/server/db/books/books';
	import { superForm } from 'sveltekit-superforms';
	import { createDropdownMenu, melt } from '@melt-ui/svelte';
	import { fly } from 'svelte/transition';
	import { userListReleaseStatus } from '$lib/db/dbConsts';
	import Icon from '$lib/components/icon/Icon.svelte';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { Infer } from 'sveltekit-superforms/server';
	import type { userListReleaseSchema } from '$lib/server/zod/schema';

	export let release: BookR['releases'][number];
	export let userListReleaseForm: SuperValidated<Infer<typeof userListReleaseSchema>>;
	export let placement:
		| 'top'
		| 'top-start'
		| 'top-end'
		| 'right'
		| 'right-start'
		| 'right-end'
		| 'bottom'
		| 'bottom-start'
		| 'bottom-end'
		| 'left'
		| 'left-start'
		| 'left-end'
		| undefined = 'bottom-end';
	export let showStatus: boolean = false;

	const sForm = superForm(userListReleaseForm, {
		dataType: 'json',
		invalidateAll: 'force',
		onUpdated: async ({ form }) => {
			addToast({
				data: {
					title: form.message?.text ?? 'Success',
					type: form.message?.type || 'error',
				},
			});
			console.log(release);
		},
	});

	const { form, message, enhance, delayed, formId, submitting } = sForm;

	const {
		elements: { trigger, menu, item, overlay },
		states: { open },
	} = createDropdownMenu({
		forceVisible: true,
		preventScroll: false,
		positioning: { placement },
	});
</script>

<button
	use:melt={$trigger}
	type="button"
	disabled={$submitting}
	class="flex items-center gap-2 h-fit"
	aria-label="Open release options"
>
	{#if $delayed}
		<Icon name="loading" class="animate-spin" />
	{:else if release.user_list_release}
		<Icon name="packageCheck" />
	{:else}
		<Icon name="package" />
	{/if}
	{#if showStatus && !$delayed}
		<span class="first-letter:capitalize"
			>{release.user_list_release?.release_status ?? 'Not in your collection'}</span
		>
	{/if}
</button>

{#if $open}
	<div use:melt={$overlay} class="fixed inset-0 z-40" />
	<section class="menu" use:melt={$menu} transition:fly={{ duration: 150, y: -10 }}>
		<form class="flex flex-col" action="/api/i/user/release/{release.id}" method="POST" use:enhance>
			{#each userListReleaseStatus as status}
				<button
					class="sidebar-item capitalize"
					class:active={release.user_list_release?.release_status === status}
					use:melt={$item}
					on:click={() => {
						if (release.user_list_release) {
							$form.type = 'update';
						} else {
							$form.type = 'add';
						}
						$form.release_status = status;
					}}>{status}</button
				>
			{/each}
			{#if release.user_list_release}
				<button
					class="sidebar-item"
					use:melt={$item}
					on:click={() => {
						$form.type = 'delete';
					}}>Remove</button
				>
			{/if}
		</form>
	</section>
{/if}

<style>
	.menu {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		background-color: var(--bg-light1);
		border-radius: 0.375rem;
		padding: 0.25rem;
		font-size: 0.875rem;
		line-height: 1.25rem;
		white-space: nowrap;
		z-index: 40;
	}

	:global(.dark) .menu {
		background-color: var(--bg-dark1);
	}
</style>
