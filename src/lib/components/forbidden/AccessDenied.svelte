<script lang="ts">
	import type { Perm } from '$lib/db/permissions';

	export let missingPerm: Perm | undefined;
</script>

<h1 class="error-text-color font-bold text-xl">Access Denied</h1>
<p>You do not have the necessary permissions to access this page.</p>
{#if missingPerm === 'add'}
	<p>
		You need the 'add' permission. You can join the <a
			href="https://discord.gg/ZeAnhGncFx"
			class="link"
			target="_blank">Discord server</a
		> to obtain this permission.
	</p>
{:else}
	<p>You may need to verify your account before you can access this page.</p>
{/if}
