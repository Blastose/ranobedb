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
		? 'text-white bg-[#73739C]'
		: 'bg-[#cdcedd] hover:bg-[#bbbcce]  dark:text-white dark:bg-[#505152] dark:hover:bg-[#434446]'}"
>
	<a sveltekit:prefetch href="{newUrl.pathname}{newUrl.search}">
		<div class="px-4 py-1">
			<span>{name}</span>
		</div>
	</a>
</div>
