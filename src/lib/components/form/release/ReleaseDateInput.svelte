<script lang="ts">
	import type { releaseSchema } from '$lib/zod/schema';
	import { type SuperForm, type Infer, formFieldProxy } from 'sveltekit-superforms';
	import { DateNumber } from './releaseDate';

	export let form: SuperForm<Infer<typeof releaseSchema>, App.Superforms.Message>;

	const { value, errors, constraints } = formFieldProxy(form, 'release_date');

	const years: ('TBA' | number)[] = [
		'TBA',
		...Array.from({ length: 131 }, (_, index) => 2030 - index)
	] as const;
	const months: string[] = [
		'-month-',
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
		'Dec.'
	] as const;
	const days: ('-day-' | number)[] = [
		'-day-',
		...Array.from({ length: 31 }, (_, index) => index + 1)
	] as const;

	function resetMonthOptions() {
		const monthOptions = selectContainer.querySelectorAll<HTMLOptionElement>('.month-option');
		for (const item of monthOptions) {
			if (item.value === '0') {
				item.selected = true;
				break;
			}
		}
	}
	function resetDayOptions() {
		const dayOptions = selectContainer.querySelectorAll<HTMLOptionElement>('.day-option');
		for (const item of dayOptions) {
			if (item.value === '-day-') {
				item.selected = true;
				break;
			}
		}
	}

	const initalDate = new DateNumber($value);
	let hideMonth = initalDate.getYear() === 9999;
	let hideDay = initalDate.getYear() === 9999 || initalDate.getMonth() === 99;
	function handleYearChange(e: Event & { currentTarget: EventTarget & HTMLSelectElement }) {
		const inputValue = e.currentTarget.value;
		if (inputValue === 'TBA') {
			const newDateNumber = new DateNumber($value);
			newDateNumber.setYear(9999);
			newDateNumber.setMonth(99);
			newDateNumber.setDay(99);
			value.set(newDateNumber.date);
			hideMonth = true;
			hideDay = true;
			resetMonthOptions();
			resetDayOptions();
		} else {
			value.set(new DateNumber($value).setYear(Number(inputValue)));
			hideMonth = false;
			hideDay = false;
		}
	}
	function handleMonthChange(e: Event & { currentTarget: EventTarget & HTMLSelectElement }) {
		const inputValue = e.currentTarget.value;
		if (inputValue === '0') {
			const newDateNumber = new DateNumber($value);
			newDateNumber.setMonth(99);
			newDateNumber.setDay(99);
			value.set(newDateNumber.date);
			hideDay = true;
			resetDayOptions();
		} else {
			value.set(new DateNumber($value).setMonth(Number(inputValue)));
			hideDay = false;
		}
	}
	function handleDayChange(e: Event & { currentTarget: EventTarget & HTMLSelectElement }) {
		const inputValue = e.currentTarget.value;
		if (inputValue === '-day-') {
			const newDateNumber = new DateNumber($value);
			newDateNumber.setDay(99);
			value.set(newDateNumber.date);
		} else {
			value.set(new DateNumber($value).setDay(Number(inputValue)));
		}
	}

	let selectContainer: HTMLDivElement;
</script>

<div>
	<label class="flex flex-col gap-1">
		<span>Release date</span>
		<div class="flex gap-2" bind:this={selectContainer}>
			<select on:change={handleYearChange} class="input reset-padding" name="" id="">
				{#each years as year}
					<option
						value={year}
						selected={year === initalDate.getYear() ||
							(year === 'TBA' && initalDate.getYear() === 9999)}>{year}</option
					>
				{/each}
			</select>
			{#if !hideMonth}
				<select on:change={handleMonthChange} class="input reset-padding" name="" id="">
					{#each months as month, index}
						<option
							class="month-option"
							value={index}
							selected={index === initalDate.getMonth() ||
								(index === 0 && initalDate.getMonth() === 99)}
							>{#if index === 0}{month}{:else}{index} ({month}){/if}</option
						>
					{/each}
				</select>
			{/if}
			{#if !hideDay}
				<select on:change={handleDayChange} class="input reset-padding" name="" id="">
					{#each days as day, index}
						{@const currentDateNumber = new DateNumber($value)}
						{@const maxNumberOfDays = new Date(
							currentDateNumber.getYear(),
							currentDateNumber.getMonth(),
							0
						).getDate()}
						{#if index - 1 < maxNumberOfDays}
							<option
								class="day-option"
								value={day}
								selected={day === initalDate.getDay() ||
									(day === '-day-' && initalDate.getDay() == 99)}>{day}</option
							>
						{/if}
					{/each}
				</select>
			{/if}
		</div>
	</label>
</div>

<style>
	select {
		width: fit-content;
	}
</style>
