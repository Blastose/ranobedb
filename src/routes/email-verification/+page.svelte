<script lang="ts">
	import NoIndex from '$lib/components/layout/NoIndex.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
</script>

<PageTitle title="Email verification" />
<NoIndex />

<main class="container-rndb flex flex-col gap-2">
	<h1 class="text-3xl font-bold">Email verification</h1>

	<p>Your email has successfully changed and is now verified.</p>

	<p>If you aren't already logged in, you can do so <a href="/login" class="link">now</a>.</p>
</main>
