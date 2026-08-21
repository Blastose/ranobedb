<script lang="ts">
	import DbRouteShell from '$lib/components/layout/db/DBRouteShell.svelte';
	import DbItemShellUser from '$lib/components/layout/db/DBItemShellUser.svelte';
	import LinkBox from '$lib/components/layout/db/LinkBox.svelte';
	import { getThemeContext } from '$lib/stores/themeStore';

	interface Props {
		user: { username: string; id_numeric: number };
		hasChanges: boolean;
	}

	let { user, hasChanges }: Props = $props();
	const theme = getThemeContext();
</script>

<DbRouteShell theme={$theme} bgImageStyle={null}>
	<DbItemShellUser {user} profile_image={{ filename: null }}>
		<main class="flex flex-col gap-4">
			<p class="error-text-color font-bold">This user's profile is private.</p>

			{#if hasChanges}
				<div class="w-fit">
					<LinkBox display="Edit history" href="/user/{user.id_numeric}/history" />
				</div>
			{/if}
		</main>
	</DbItemShellUser>
</DbRouteShell>
