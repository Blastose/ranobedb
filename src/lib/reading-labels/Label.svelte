<script lang="ts">
	import { page } from '$app/stores';

	export let name = '';
	export let queryName = '';
	export let queryValue = '';

	let newUrl = new URL($page.url);
	newUrl.searchParams.set(queryName, queryValue);
</script>

<div
	class="rounded-sm
  {$page.url.searchParams.get(queryName) === queryValue ||
	(queryValue === '' && !$page.url.searchParams.get(queryName))
		? 'text-white bg-primary-500'
		: 'bg-primary-300 hover:bg-primary-400  dark:text-white dark:bg-dark-300 dark:hover:bg-dark-400'}"
>
	<a sveltekit:prefetch href="{newUrl.pathname}{newUrl.search}">
		<div class="px-4 py-1">
			<span>{name}</span>
		</div>
	</a>
</div>
