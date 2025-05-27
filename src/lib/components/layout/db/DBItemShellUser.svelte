<script lang="ts">
	// This is a copy of DBItemShell.svelte, but for users only, since it's hard to refactor it for users
	import type { SafeUser } from '$lib/server/db/user/user';

	interface Props {
		user: SafeUser;
		children?: import('svelte').Snippet;
	}

	let { user, children }: Props = $props();
</script>

<section class="flex flex-col gap-2">
	<section>
		<p class="opacity-80 capitalize">User</p>
		<div class="flex gap-2 sm:gap-8 justify-between">
			<div class="flex flex-col">
				<h1 class="text-2xl font-bold">
					{user.username}
				</h1>
			</div>
		</div>
	</section>

	{@render children?.()}
</section>
