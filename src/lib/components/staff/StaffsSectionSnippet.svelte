<script lang="ts">
	import type { BookR } from '$lib/server/db/books/books';
	import NameDisplay from '../display/NameDisplay.svelte';

	export let staffs: BookR['editions'][number]['staff'];
</script>

<div class="flex flex-wrap gap-4">
	{#each staffs as staff (`${staff.staff_id}${staff.role_type}`)}
		<div>
			<a class="flex flex-col link-box px-4 py-2 rounded-md" href="/staff/{staff.staff_id}">
				<span><NameDisplay obj={staff} /></span>
				<span class="sub-text">{staff.role_type}</span>
				<span class="sub-text text-sm">{staff.note}</span>
			</a>
		</div>
	{/each}
</div>
