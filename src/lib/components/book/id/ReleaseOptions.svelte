<script lang="ts">
	import { addToast } from '$lib/components/toast/Toaster.svelte';
	import type { BookOne } from '$lib/server/db/books/books';
	import { superForm } from 'sveltekit-superforms';
	import { DropdownMenu } from 'bits-ui';
	import { fly } from 'svelte/transition';
	import { userListReleaseStatus } from '$lib/db/dbConsts';
	import Icon from '$lib/components/icon/Icon.svelte';
	import type { SuperValidated, Infer } from 'sveltekit-superforms';
	import type { userListReleaseSchema } from '$lib/server/zod/schema';

	interface Props {
		release: BookOne['releases'][number];
		userListReleaseForm: SuperValidated<Infer<typeof userListReleaseSchema>>;
		side?: 'top' | 'right' | 'bottom' | 'left';
		align?: 'start' | 'center' | 'end';
		showStatus?: boolean;
	}

	let {
		release,
		userListReleaseForm,
		side = 'bottom',
		align = 'end',
		showStatus = false,
	}: Props = $props();

	// svelte-ignore state_referenced_locally
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
		},
	});

	const { form, enhance, delayed, submitting } = sForm;
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger disabled={$submitting}>
		{#snippet child({ props })}
			<button
				{...props}
				type="button"
				class="flex h-fit items-center gap-2"
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
		{/snippet}
	</DropdownMenu.Trigger>

	<DropdownMenu.Portal>
		<DropdownMenu.Content forceMount {side} {align} sideOffset={6} preventScroll={false}>
			{#snippet child({ wrapperProps, props, open: contentOpen })}
				{#if contentOpen}
					<div {...wrapperProps}>
						<div {...props} class="menu" transition:fly={{ duration: 150, y: -10 }}>
							<form
								class="flex flex-col"
								action="/api/i/user/release/{release.id}"
								method="POST"
								use:enhance
							>
								{#each userListReleaseStatus as status}
									<DropdownMenu.Item
										onSelect={() => {
											if (release.user_list_release) {
												$form.type = 'update';
											} else {
												$form.type = 'add';
											}
											$form.release_status = status;
										}}
									>
										{#snippet child({ props: itemProps })}
											<button
												{...itemProps}
												class="sidebar-item capitalize"
												class:active={release.user_list_release?.release_status === status}
												>{status}</button
											>
										{/snippet}
									</DropdownMenu.Item>
								{/each}
								{#if release.user_list_release}
									<DropdownMenu.Item onSelect={() => ($form.type = 'delete')}>
										{#snippet child({ props: itemProps })}
											<button {...itemProps} class="sidebar-item">Remove</button>
										{/snippet}
									</DropdownMenu.Item>
								{/if}
							</form>
						</div>
					</div>
				{/if}
			{/snippet}
		</DropdownMenu.Content>
	</DropdownMenu.Portal>
</DropdownMenu.Root>

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
