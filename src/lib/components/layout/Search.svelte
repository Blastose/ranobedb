<script>
	import { IconSearch } from '@tabler/icons-svelte';
</script>

<div class="flex items-center gap-2">
	<IconSearch />
	<input
		class="focus:ring-2 focus:ring-[#9b9fb9] focus:outline-none rounded-md w-full max-w-[240px] lg:max-w-sm px-2 py-1 bg-gray-200 dark:bg-neutral-700"
		type="text"
		placeholder="Search"
	/>
</div>
