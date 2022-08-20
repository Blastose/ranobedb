<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	export let person: { name: string; id: number };
	export let type: string;
</script>

<div
	class="bg-[#cfd7e7] hover:bg-[#697596] duration-75 hover:text-white rounded-sm shadow-sm text-sm"
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
