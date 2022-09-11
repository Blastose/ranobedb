<script lang="ts">
	import LinkWrapper from '$lib/components/LinkWrapper.svelte';
	export let text: any;
	export let title: string;
	export let url: string | null = null;
</script>

<div
	{title}
	class="bg-[#cfd7e7] 
		{url ? 'hover:bg-[#697596] hover:text-white dark:hover:bg-dark-400 ' : ''}
		 dark:text-white 
		 dark:bg-dark-200 

		 duration-75 
		 rounded-sm 
		 shadow-sm 
		 text-sm"
>
	<LinkWrapper {url}>
		<div class="px-2 py-1 flex gap-1 items-center justify-center">
			<slot />
			<span>{text}</span>
		</div>
	</LinkWrapper>
</div>
