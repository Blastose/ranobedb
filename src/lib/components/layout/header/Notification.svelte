<script lang="ts">
	import { createDropdownMenu, melt } from '@melt-ui/svelte';
	import { fade, fly } from 'svelte/transition';
	import Icon from '$lib/components/icon/Icon.svelte';
	import Hr from '../Hr.svelte';
	import { onMount } from 'svelte';
	import type { Notification } from '$lib/server/db/notifications/notifications';
	import { relativeTime } from '$lib/utils/relative-time';
	import MarkdownToHtml from '$lib/components/markdown/MarkdownToHtml.svelte';

	let hasNotifs: boolean = false;

	let notifications: Notification[] | undefined = undefined;

	onMount(async () => {
		const res = (await (await fetch('/api/i/user/notifications/has')).json()) as boolean;
		hasNotifs = res;
	});

	const {
		elements: { trigger, menu, item },
		states: { open },
	} = createDropdownMenu({
		forceVisible: true,
		preventScroll: false,
		positioning: { placement: 'bottom-end', gutter: 16 },
	});

	async function getNotifications() {
		if (!notifications) {
			notifications = (await (await fetch('/api/i/user/notifications')).json()) as Notification[];
		}
	}

	async function markAllAsRead() {
		await fetch('/api/i/user/notifications', { method: 'POST' });
		hasNotifs = false;
		if (notifications) {
			for (const n of notifications) {
				n.is_read = true;
			}
		}
	}
</script>

<button
	use:melt={$trigger}
	type="button"
	aria-label="Open notifications"
	on:click={getNotifications}
>
	<span class="relative block">
		{#if $open}
			<Icon name="bell" />
		{:else}
			<Icon name="bellOutline" />
		{/if}
		{#if hasNotifs}
			<span
				class="absolute w-2 h-2 top-0 right-0 bg-[#7c7bb4] dark:bg-[#c6c5ff] rounded-full"
				transition:fade
			></span>
		{/if}
	</span>
</button>

{#if $open}
	<section class="notification-menu" use:melt={$menu} transition:fly={{ duration: 150, y: -10 }}>
		<div class="flex flex-col px-2 pt-2">
			<div class="flex justify-between items-center">
				<p class="text-lg font-bold">Notifications</p>

				<a href="/settings?view=list" aria-label="Settings" use:melt={$item}>
					<Icon name="settings" />
				</a>
			</div>

			<div class="flex justify-between items-center">
				<a class="link text-sm" href="/notifications" use:melt={$item}>View all notifications</a>
				<button type="button" on:click={markAllAsRead} class="link text-sm" use:melt={$item}
					>Mark all as read</button
				>
			</div>
		</div>
		<Hr />
		<div class="content thin-scrollbar">
			<div class="flex flex-col">
				{#if notifications}
					{#each notifications as notification}
						{@const date = new Date(notification.sent * 1000)}
						<a
							class="notif"
							href={notification.url}
							use:melt={$item}
							on:m-pointermove={(e) => e.preventDefault()}
						>
							{#if notification.image}
								{#key notification.image.filename}
									<img
										src="https://images.ranobedb.org/{notification.image.filename}"
										alt=""
										width="240"
										height="343"
										class="rounded-lg w-[48px]"
									/>
								{/key}
							{:else}
								<div class="flex items-center justify-center">
									<Icon name="book" width="24" height="24" />
								</div>
							{/if}
							<div class="flex flex-col">
								<div class="grid grid-cols-[1fr_64px] gap-2">
									<div class="flex font-semibold text-sm gap-2 items-baseline">
										<p class="w-fit">{notification.notification_type}</p>
										{#if !notification.is_read}
											<span
												aria-label="Unread"
												class="block w-2 h-2 bg-[#7c7bb4] dark:bg-[#c6c5ff] rounded-full"
											></span>
										{/if}
									</div>
									<time
										title={date.toLocaleString()}
										datetime={date.toISOString()}
										class="text-xs opacity-75">{relativeTime(notification.sent)}</time
									>
								</div>

								<div class="text-xs">
									<MarkdownToHtml markdown={notification.message} type="full" />
								</div>
							</div>
						</a>
					{:else}
						<div class="px-2 pb-2">
							<p class="italic">No notifications</p>
						</div>
					{/each}
				{:else}
					<div class="flex items-center justify-center pb-2">
						<Icon class="animate-spin" name="loading" height="24" width="24" />
					</div>
				{/if}
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
		max-width: calc(100vw - 48px);
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
