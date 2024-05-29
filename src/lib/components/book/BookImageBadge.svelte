<script lang="ts">
	export let badges: string[];
</script>

<div class="absolute top-0 right-0 flex flex-col gap-1 p-1 sm:p-2 items-end">
	<div class="bg-black/90 dark-main-text w-fit text-sm sm:text-base rounded-full px-2">
		{#each badges as badge}
			{badge}
		{/each}
	</div>
</div>
