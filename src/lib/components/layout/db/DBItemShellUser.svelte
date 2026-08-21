<script lang="ts">
	import { buildAvatarImageUrl } from '$lib/components/book/book';

	// This is a copy of DBItemShell.svelte, but for users only, since it's hard to refactor it for users

	interface Props {
		user: { username: string };
		profile_image: { filename: string | null };
		children?: import('svelte').Snippet;
	}

	let { user, profile_image, children }: Props = $props();
</script>

<section class="flex flex-col gap-2">
	<section>
		<p class="capitalize opacity-80">User</p>
		<div class="flex justify-between gap-2 sm:gap-8">
			<div class="flex items-center gap-2">
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
