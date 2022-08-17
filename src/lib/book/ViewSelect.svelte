<script lang="ts">
	import View from '$lib/models/view';
	import { booksView } from '$lib/stores/booksViewStore';
	import Icon from '$lib/components/Icon.svelte';

	const onClick = (viewType: View) => {
		booksView.set(viewType);
	};
</script>

<div>
	<div class="flex">
		{#each Object.values(View) as viewValue}
			<button
				on:click={() => {
					onClick(viewValue);
				}}
				class="
          {$booksView === viewValue
					? 'text-white bg-[#73739C]'
					: 'bg-[#e4e7ee]  hover:bg-[#c6ccd8] '}
          p-2"
			>
				<Icon height="24" width="24" name={viewValue} />
			</button>
		{/each}
	</div>
</div>
