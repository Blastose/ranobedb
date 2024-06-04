<script lang="ts" context="module">
	type Rec = Record<string, unknown>;
</script>

<script lang="ts" generics="T extends Rec">
	import {
		type SuperForm,
		type Infer,
		formFieldProxy,
		type FormPathLeaves,
		numberProxy,
	} from 'sveltekit-superforms';
	import { DateNumber } from './releaseDate';

	export let form: SuperForm<T, App.Superforms.Message>;
	export let field: FormPathLeaves<T>;
	export let label: string;

	const { value, errors, constraints } = formFieldProxy(form, field);
	const proxy = numberProxy(form, field);

	const years = ['TBA', ...Array.from({ length: 131 }, (_, index) => 2030 - index)] as const;
	const months = [
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
		'Dec.',
	] as const;
	const days = ['-day-', ...Array.from({ length: 31 }, (_, index) => index + 1)] as const;

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

	const initalDate = new DateNumber(Number($proxy));
	let hideMonth = initalDate.getYear() === 9999;
	let hideDay = initalDate.getYear() === 9999 || initalDate.getMonth() === 99;
	function handleYearChange(e: Event & { currentTarget: EventTarget & HTMLSelectElement }) {
		const inputValue = e.currentTarget.value;
		if (inputValue === 'TBA') {
			const newDateNumber = new DateNumber(Number($value));
			newDateNumber.setYear(9999);
			newDateNumber.setMonth(99);
			newDateNumber.setDay(99);
			proxy.set(newDateNumber.date.toString());
			hideMonth = true;
			hideDay = true;
			resetMonthOptions();
			resetDayOptions();
		} else {
			proxy.set(new DateNumber(Number($proxy)).setYear(Number(inputValue)).toString());
			hideMonth = false;
			hideDay = hideDay ?? false;
		}
	}
	function handleMonthChange(e: Event & { currentTarget: EventTarget & HTMLSelectElement }) {
		const inputValue = e.currentTarget.value;
		if (inputValue === '0') {
			const newDateNumber = new DateNumber(Number($proxy));
			newDateNumber.setMonth(99);
			newDateNumber.setDay(99);
			proxy.set(newDateNumber.date.toString());
			hideDay = true;
			resetDayOptions();
		} else {
			proxy.set(new DateNumber(Number($proxy)).setMonth(Number(inputValue)).toString());
			hideDay = false;
		}
	}
	function handleDayChange(e: Event & { currentTarget: EventTarget & HTMLSelectElement }) {
		const inputValue = e.currentTarget.value;
		if (inputValue === '-day-') {
			const newDateNumber = new DateNumber(Number($proxy));
			newDateNumber.setDay(99);
			proxy.set(newDateNumber.date.toString());
		} else {
			proxy.set(new DateNumber(Number($proxy)).setDay(Number(inputValue)).toString());
		}
	}

	let selectContainer: HTMLDivElement;
</script>

<div class="flex flex-col gap-1">
	<label class="flex flex-col gap-1">
		<span>{label}</span>
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
						{@const currentDateNumber = new DateNumber(Number($proxy))}
						{@const maxNumberOfDays = new Date(
							currentDateNumber.getYear(),
							currentDateNumber.getMonth(),
							0,
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
	{#if $errors}
		<p class="error-text-color">{$errors}</p>
	{/if}
</div>

<style>
	select {
		width: fit-content;
	}
</style>
