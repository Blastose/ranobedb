<script lang="ts">
	import { buildAvatarImageUrl, buildImageUrl } from '$lib/components/book/book';

	// This is a copy of DBItemShell.svelte, but for users only, since it's hard to refactor it for users
	import type { SafeUser } from '$lib/server/db/user/user';

	interface Props {
		user: SafeUser;
		profile_image: { filename: string | null };
		children?: import('svelte').Snippet;
	}

	let { user, profile_image, children }: Props = $props();
</script>

<section class="flex flex-col gap-2">
	<section>
		<p class="opacity-80 capitalize">User</p>
		<div class="flex gap-2 sm:gap-8 justify-between">
			<div class="flex gap-2 items-center">
				{#if profile_image.filename}
					<div class="profile-button">
						<img src={buildAvatarImageUrl(profile_image.filename)} alt="" />
					</div>
				{/if}
				<h1 class="text-2xl font-bold">
					{user.username}
				</h1>
			</div>
		</div>
	</section>

	{@render children?.()}
</section>
