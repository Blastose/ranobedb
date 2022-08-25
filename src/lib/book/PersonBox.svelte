<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	export let person: { name: string; id: number };
	export let type: string;
</script>

<!-- Database query can return a null person. Ideally, the array should be empty, but since it isn't we need to exclude the result -->
<!-- Can remove this check when we update the query -->
{#if person.id !== null}
	<div
		class="bg-[#cfd7e7] hover:bg-[#697596] dark:text-white dark:bg-dark-200 dark:hover:bg-dark-400 duration-75 hover:text-white rounded-sm shadow-sm text-sm"
	>
		<a href="/person/{person.id}">
			<div class="px-2 py-1 flex gap-1 items-center justify-center">
				{#if type === 'artist'}
					<span><Icon height="20" width="20" name="palette" /></span>
				{:else if type === 'author'}
					<span><Icon height="20" width="20" name="pencil" /></span>
				{/if}
				<span>{person.name}</span>
			</div>
		</a>
	</div>
{/if}
