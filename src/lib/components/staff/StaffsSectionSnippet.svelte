<script lang="ts">
	import type { BookOne } from '$lib/server/db/books/books';
	import NameDisplay from '../display/NameDisplay.svelte';

	export let staffs: BookOne['editions'][number]['staff'];
</script>

<div class="flex flex-wrap gap-4">
	{#each staffs as staff}
		<div>
			<a class="flex flex-col link-box round px-4 py-2" href="/staff/{staff.staff_id}">
				<span><NameDisplay obj={staff} /></span>
				<span class="capitalize sub-text text-sm">{staff.role_type}</span>
				<span class="sub-text text-xs">{staff.note}</span>
			</a>
		</div>
	{/each}
</div>
