<script lang="ts">
	import { createDropdownMenu, melt } from '@melt-ui/svelte';
	import type { User } from 'lucia';
	import { fly } from 'svelte/transition';
	import Icon from '$lib/components/icon/Icon.svelte';
	import Hr from '../Hr.svelte';
	import { getContext } from 'svelte';
	import type { Notification } from '$lib/server/db/notifications/notifications';
	import type { Writable } from 'svelte/store';
	import { relativeTime } from '$lib/utils/relative-time';
	import MarkdownToHtml from '$lib/components/markdown/MarkdownToHtml.svelte';

	export let user: User;
	// TODO
	user;

	const notifications = getContext<Writable<Notification[]>>('notifications');

	const {
		elements: { trigger, menu, item, separator, arrow },
		states: { open },
	} = createDropdownMenu({
		forceVisible: true,
		preventScroll: false,
		positioning: { placement: 'bottom-end', gutter: 16 },
	});
</script>

<button use:melt={$trigger} type="button" aria-label="Open notifications">
	{#if $open}
		<Icon name="bell" />
	{:else}
		<span class="relative">
			<Icon name="bellOutline" />
			{#if $notifications.length > 0}
				<span class="absolute w-2 h-2 top-0 right-0 bg-[#7c7bb4] dark:bg-[#c6c5ff] rounded-full"
				></span>
			{/if}
		</span>
	{/if}
</button>

{#if $open}
	<section class="notification-menu" use:melt={$menu} transition:fly={{ duration: 150, y: -10 }}>
		<div class="flex flex-col px-2 pt-2">
			<div class="flex justify-between items-center">
				<p class="text-lg font-bold">Notifications</p>

				<a href="/settings" aria-label="Settings" use:melt={$item}>
					<Icon name="settings" />
				</a>
			</div>

			<div class="flex justify-between items-center">
				<a class="link text-sm" href="/" use:melt={$item}>View all notifications</a>
				<button class="link text-sm" use:melt={$item}>Mark all as read</button>
			</div>
		</div>
		<Hr />
		<div class="content thin-scrollbar">
			<div class="flex flex-col">
				{#each $notifications as notification}
					<a class="notif" href={notification.url} use:melt={$item}>
						{#if notification.image_filename}
							<img
								src="https://images.ranobedb.org/{notification.image_filename}"
								alt=""
								width="240"
								height="343"
								class="rounded-lg w-[48px]"
							/>
						{:else}
							<div class="flex items-center justify-center">
								<Icon name="book" width="24" height="24" />
							</div>
						{/if}
						<div class="flex flex-col">
							<div class="flex justify-between items-center">
								<p class="font-semibold text-sm">{notification.notification_type}</p>
								<time
									title={notification.sent.toLocaleString()}
									datetime={notification.sent.toISOString()}
									class="text-xs opacity-75">{relativeTime(notification.sent)}</time
								>
							</div>

							<div class="text-xs">
								<MarkdownToHtml markdown={notification.message} type="full" />
							</div>
						</div>
					</a>
				{/each}
			</div>
		</div>
	</section>
{/if}

<style>
	.notification-menu {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		width: 24rem;
		background-color: var(--bg-light1);
		border-radius: 0.375rem;
		overflow: hidden;
		z-index: 10;
		max-height: calc(100dvh - 80px);
	}

	:global(.dark) .notification-menu {
		background-color: var(--bg-dark1);
	}

	.content {
		overflow-y: scroll;
		width: 100%;
		max-height: 500px;
	}

	.notif {
		display: grid;
		gap: 0.5rem;
		padding: 0.25rem 0.5rem;
		transition: background-color 300ms;
		grid-template-columns: 48px 1fr;
	}

	.notif:hover {
		background-color: var(--primary-300);
	}

	:global(.dark) .notif:hover {
		background-color: var(--dark-400);
	}
</style>
