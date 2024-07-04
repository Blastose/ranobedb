<script lang="ts">
	import NoIndex from '$lib/components/layout/NoIndex.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import DbItemShellUser from '$lib/components/layout/db/DBItemShellUser.svelte';
	import DbRouteShell from '$lib/components/layout/db/DBRouteShell.svelte';
	import LinkBox from '$lib/components/layout/db/LinkBox.svelte';
	import { getThemeContext } from '$lib/stores/themeStore';

	export let data;

	const theme = getThemeContext();
</script>

<PageTitle title={data.routeUser.username} />
<NoIndex />

<DbRouteShell theme={$theme} bgImageStyle={null}>
	<DbItemShellUser user={data.routeUser}>
		<main class="flex flex-col gap-2">
			<dl>
				<div>
					<dt>Joined</dt>
					<dd>{new Date(data.routeUser.joined).toLocaleDateString('sv')}</dd>
					<dt>Role</dt>
					<dd>{data.routeUser.role}</dd>
				</div>
			</dl>

			<div class="w-fit flex gap-4">
				<LinkBox display="Reading list" href="/user/{data.routeUser.id_numeric}/list" />
				<LinkBox display="Edit history" href="/user/{data.routeUser.id_numeric}/history" />
			</div>
		</main>
	</DbItemShellUser>
</DbRouteShell>

<style>
	dl > div {
		display: grid;
		grid-template-columns: 100px 1fr;
	}

	dt {
		font-weight: 700;
	}
</style>
