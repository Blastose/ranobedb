<script lang="ts">
	import Icon from '$lib/components/icon/Icon.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import MarkdownToHtml from '$lib/components/markdown/MarkdownToHtml.svelte';
	import PaginationContainer from '$lib/components/pagination/PaginationContainer.svelte';
	import { relativeTime } from '$lib/utils/relative-time';

	let { data } = $props();
</script>

<PageTitle title="Notifications" />

<main class="container-rndb flex flex-col gap-4">
	<h1 class="text-4xl font-bold">Notifications</h1>

	<div class="max-w-2xl">
		<PaginationContainer
			results={data.count}
			currentPage={data.currentPage}
			totalPages={data.totalPages}
			showTopPages={false}
		>
			<div class="flex flex-col gap-4">
				{#each data.notifications as notification}
					{@const date = new Date(notification.sent * 1000)}
					<a class="notif" href={notification.url}>
						{#if notification.image}
							<img
								src="https://images.ranobedb.org/{notification.image.filename}"
								alt=""
								width="240"
								height="343"
								class="rounded-lg w-[60px]"
							/>
						{:else}
							<div class="flex items-center justify-center">
								<Icon name="book" width="24" height="24" />
							</div>
						{/if}
						<div class="flex flex-col">
							<div class="flex justify-between items-center">
								<div class="font-semibold flex gap-2 items-center">
									<p>{notification.notification_type}</p>
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

							<div class="text-sm">
								<MarkdownToHtml markdown={notification.message} type="full" />
							</div>
						</div>
					</a>
				{:else}
					<div class="px-2 pb-2">
						<p class="italic">No notifications</p>
					</div>
				{/each}
			</div>
		</PaginationContainer>
	</div>
</main>

<style>
	.notif {
		display: grid;
		gap: 0.5rem;
		padding: 0.5rem 1rem 0.5rem 0.5rem;
		transition: background-color 300ms;
		grid-template-columns: 60px 1fr;
		border-radius: 0.5rem;
		background-color: var(--primary-200);
	}

	:global(.dark) .notif {
		background-color: var(--bg-dark1);
	}

	.notif:hover {
		background-color: var(--primary-300);
	}

	:global(.dark) .notif:hover {
		background-color: var(--dark-400);
	}
</style>
