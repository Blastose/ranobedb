<script lang="ts">
	import type { Language } from '$lib/server/db/dbTypes';

	export let lang: Language;
</script>

<div class="pt-[4px]">
	<p class="sub-text">
		{lang}
	</p>
</div>

<style>
	.sub-text {
		display: flex;
		align-items: center;
		justify-content: center;
		height: fit-content;
		font-size: 0.625rem;
		line-height: 1rem;
		font-weight: 600;
		text-transform: uppercase;
		border-radius: 0.375rem;
		border-width: 1px;
		border-color: var(--text-light-sub);
	}

	:global(.dark) .sub-text {
		border-color: var(--text-dark-sub);
	}
</style>
