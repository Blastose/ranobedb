<script lang="ts">
	import { DropdownMenu } from 'bits-ui';
	import { fade, fly } from 'svelte/transition';
	import Icon from '$lib/components/icon/Icon.svelte';
	import Hr from '../Hr.svelte';
	import { onMount } from 'svelte';
	import type { Notification } from '$lib/server/db/notifications/notifications';
	import { relativeTime } from '$lib/utils/relative-time';
	import MarkdownToHtml from '$lib/components/markdown/MarkdownToHtml.svelte';

	let hasNotifs = $state(false);
	let notifications = $state<Notification[] | undefined>(undefined);
	let open = $state(false);

	onMount(async () => {
		const res = (await (await fetch('/api/i/user/notifications/has')).json()) as boolean;
		hasNotifs = res;
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

<DropdownMenu.Root
	bind:open
	onOpenChange={(open) => {
		if (open) getNotifications();
	}}
>
	<DropdownMenu.Trigger type="button" aria-label="Open notifications">
		<span class="relative block">
			{#if open}
				<Icon name="bell" />
			{:else}
				<Icon name="bellOutline" />
			{/if}
			{#if hasNotifs}
				<span
					class="absolute right-0 top-0 h-2 w-2 rounded-full bg-[#7c7bb4] dark:bg-[#c6c5ff]"
					transition:fade
				></span>
			{/if}
		</span>
	</DropdownMenu.Trigger>

	<DropdownMenu.Content forceMount side="bottom" align="end" sideOffset={16}>
		{#snippet child({ props, wrapperProps, open: contentOpen })}
			{#if contentOpen}
				<div {...wrapperProps}>
					<section {...props} class="notification-menu" transition:fly={{ duration: 150, y: -10 }}>
						<div class="flex flex-col px-2 pt-2">
							<div class="flex items-center justify-between">
								<p class="text-lg font-bold">Notifications</p>

								<DropdownMenu.Item>
									{#snippet child({ props })}
										<a {...props} href="/settings?view=list" aria-label="Settings">
											<Icon name="settings" />
										</a>
									{/snippet}
								</DropdownMenu.Item>
							</div>

							<div class="flex items-center justify-between">
								<DropdownMenu.Item>
									{#snippet child({ props })}
										<a {...props} class="link text-sm" href="/notifications"
											>View all notifications</a
										>
									{/snippet}
								</DropdownMenu.Item>
								<DropdownMenu.Item onSelect={markAllAsRead}>
									{#snippet child({ props })}
										<button {...props} type="button" class="link text-sm">Mark all as read</button>
									{/snippet}
								</DropdownMenu.Item>
							</div>
						</div>
						<Hr />
						<div class="content thin-scrollbar">
							<div class="flex flex-col">
								{#if notifications}
									{#each notifications as notification}
										{@const date = new Date(notification.sent * 1000)}
										<DropdownMenu.Item>
											{#snippet child({ props })}
												<a {...props} class="notif" href={notification.url}>
													{#if notification.image}
														{#key notification.image.filename}
															<img
																src="https://images.ranobedb.org/{notification.image.filename}"
																alt=""
																width="240"
																height="343"
																class="w-[48px] rounded-lg"
															/>
														{/key}
													{:else}
														<div class="flex items-center justify-center">
															<Icon name="book" width="24" height="24" />
														</div>
													{/if}
													<div class="flex flex-col">
														<div class="grid grid-cols-[1fr_64px] gap-2">
															<div class="flex items-baseline gap-2 text-sm font-semibold">
																<p class="w-fit">{notification.notification_type}</p>
																{#if !notification.is_read}
																	<span
																		aria-label="Unread"
																		class="block h-2 w-2 rounded-full bg-[#7c7bb4] dark:bg-[#c6c5ff]"
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
											{/snippet}
										</DropdownMenu.Item>
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
				</div>
			{/if}
		{/snippet}
	</DropdownMenu.Content>
</DropdownMenu.Root>

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
