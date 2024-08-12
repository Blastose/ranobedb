<script lang="ts">
	const years = Array.from({ length: 81 }, (_, index) => 2030 - index);
	const months = [
		'Jan.',
		'Feb.',
		'Mar.',
		'Apr.',
		'May',
		'Jun.',
		'Jul.',
		'Aug.',
		'Sep.',
		'Oct.',
		'Nov.',
		'Dec.',
	] as const;

	export let vYear: number;
	export let vMonth: number;
</script>

<div class="flex flex-col gap-1">
	<p>Date</p>

	<div>
		<select class="input reset-padding" name="" bind:value={vYear}>
			{#each years as year (year)}
				<option value={year} selected={year === vYear}>{year}</option>
			{/each}
		</select>

		<select class="input reset-padding" name="" bind:value={vMonth}>
			{#each months as month, index (month)}
				<option class="month-option" value={index + 1} selected={index === vMonth}
					>{index + 1} ({month})</option
				>
			{/each}
		</select>
	</div>
</div>
