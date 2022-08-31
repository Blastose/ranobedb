<script lang="ts">
	export let text: any;
	export let title: string;
</script>

<div
	{title}
	class="bg-[#cfd7e7] dark:text-white dark:bg-dark-200 hover:text-white rounded-sm shadow-sm text-sm"
>
	<div class="px-2 py-1 flex gap-1 items-center justify-center">
		<slot />
		<span>{text}</span>
	</div>
</div>
