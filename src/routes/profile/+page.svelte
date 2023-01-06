<script lang="ts">
	import type { PageData } from './$types';
	import {
		Chart,
		LineController,
		LineElement,
		PointElement,
		CategoryScale,
		LinearScale,
		PieController,
		ArcElement,
		Tooltip,
		Legend,
		Colors
	} from 'chart.js';
	import type { ChartConfiguration } from 'chart.js';
	import { browser } from '$app/environment';
	import { theme } from '$lib/stores/theme';
	import { onMount } from 'svelte';
	import { getUser } from '@lucia-auth/sveltekit/client';

	Chart.register(
		LineController,
		LineElement,
		PointElement,
		CategoryScale,
		LinearScale,
		PieController,
		ArcElement,
		Tooltip,
		Legend
	);
	// @ts-ignore
	Chart.register(Colors);

	const user = getUser();

	export let data: PageData;

	const createChart = (node: HTMLCanvasElement, config: ChartConfiguration) => {
		return new Chart(node, {
			type: config.type,
			data: config.data,
			options: config.options
		});
	};

	const readPerMonth = data.readPerMonth.map((row) => {
		const [year, month] = row.date.split('-');
		return { date: `${year}-${month}`, count: Number(row.count) };
	});

	const pastYearReadCountChartData: ChartConfiguration = {
		type: 'line',
		data: {
			labels: readPerMonth.map((row) => row.date),
			datasets: [
				{
					label: 'Number of book read per month',
					data: readPerMonth.map((row) => row.count)
				}
			]
		},
		options: {
			maintainAspectRatio: false,
			scales: {
				y: {
					suggestedMin: 0,
					ticks: {
						precision: 0
					},
					beginAtZero: true
				}
			},
			plugins: {
				legend: {
					onClick: () => {}
				}
			}
		}
	};

	const bookByStatusChartData: ChartConfiguration = {
		type: 'pie',
		data: {
			labels: data.readLabels.map((row) => {
				return row.label_name;
			}),
			datasets: [
				{
					label: 'Read',
					data: data.readLabels.map((row) => Number(row.count)),
					borderWidth: 0
				}
			]
		},
		options: {
			maintainAspectRatio: false
		}
	};

	const setLineChartColors = (
		chart: Chart,
		colors: {
			axisColor: string;
			gridColor: string;
		}
	) => {
		chart.options.scales!.x!.ticks!.color = colors.axisColor;
		chart.options.scales!.y!.ticks!.color = colors.axisColor;
		chart.options.scales!.x!.grid!.color = colors.gridColor;
		chart.options.scales!.y!.grid!.color = colors.gridColor;
		chart.options.plugins!.legend!.labels!.color = colors.axisColor;
		chart.update();
	};

	const setBarChartColors = (
		chart: Chart,
		colors: {
			axisColor: string;
		}
	) => {
		chart.options.plugins!.legend!.labels!.color = colors.axisColor;
		chart.update();
	};

	$: {
		if (browser && chartsLoaded) {
			if ($theme === 'dark') {
				setLineChartColors(pastYearReadCountChart, {
					axisColor: '#ccc',
					gridColor: '#404040'
				});

				setBarChartColors(bookByStatusChart, { axisColor: '#ccc' });
			} else if ($theme === 'light') {
				setLineChartColors(pastYearReadCountChart, {
					axisColor: '#666',
					gridColor: '#e3e3e3'
				});

				setBarChartColors(bookByStatusChart, { axisColor: '#666' });
			}
		}
	}

	let pastYearReadCountCanvas: HTMLCanvasElement;
	let bookByStatusCanvas: HTMLCanvasElement;
	let pastYearReadCountChart: Chart<'line'>;
	let bookByStatusChart: Chart<'pie'>;
	let chartsLoaded = false;

	onMount(() => {
		pastYearReadCountChart = createChart(pastYearReadCountCanvas, pastYearReadCountChartData);
		bookByStatusChart = createChart(bookByStatusCanvas, bookByStatusChartData);
		chartsLoaded = true;
	});
</script>

<svelte:head><title>Profile - RanobeDB</title></svelte:head>

<main class="main-container">
	<div class="flex flex-col gap-4">
		<div class="flex flex-col gap-1">
			<p class="font-bold text-2xl">Profile</p>
			<p class="font-bold text-xl">{$user?.username}</p>
		</div>
		<div>
			<p class="font-bold text-xl">Stats:</p>
		</div>
		<div class="stats-chart-container">
			<div class="flex flex-col gap-2">
				<p class="chart-title">Number of books read in the last 12 months per month:</p>
				<div class="chart-container">
					<canvas bind:this={pastYearReadCountCanvas} id="past-year-read-count-chart">
						<table>
							<caption>Number of books read in the last 12 months per month</caption>
							<thead>
								<tr>
									<th>Year and month</th>
									<th>Count</th>
								</tr>
							</thead>
							<tbody>
								{#each readPerMonth as row}
									<tr>
										<th>{row.date}</th>
										<td>{row.count}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</canvas>
				</div>
			</div>
			<div class="flex flex-col gap-2">
				<p class="chart-title">Books by reading status:</p>
				<div class="chart-container">
					<canvas bind:this={bookByStatusCanvas} id="books-by-status-chart">
						<table>
							<caption>Books by reading status</caption>
							<thead>
								<tr>
									<th>Status</th>
									<th>Count</th>
								</tr>
							</thead>
							<tbody>
								{#each data.readLabels as row}
									<tr>
										<th>{row.label_name}</th>
										<td>{row.count}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</canvas>
				</div>
			</div>
		</div>
	</div>
</main>

<style>
	.stats-chart-container {
		display: grid;
		grid-template-columns: repeat(1, minmax(0, 1fr));
		column-gap: 0.5rem;
		row-gap: 1rem;
	}

	@media (min-width: 768px) {
		.stats-chart-container {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	.chart-container {
		position: relative;
		height: 300px;
		width: 100%;
	}

	.chart-title {
		font-weight: 700;
		font-size: 1.125rem;
		line-height: 1.75rem;
		text-align: center;
	}

	table {
		width: 100%;
	}
</style>
