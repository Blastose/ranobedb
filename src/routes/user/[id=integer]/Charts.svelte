<script lang="ts">
	import { browser } from '$app/environment';
	import DbItemShellUser from '$lib/components/layout/db/DBItemShellUser.svelte';
	import DbRouteShell from '$lib/components/layout/db/DBRouteShell.svelte';
	import LinkBox from '$lib/components/layout/db/LinkBox.svelte';
	import type { UserLabel } from '$lib/server/db/user/list.js';
	import { getThemeContext } from '$lib/stores/themeStore';
	import {
		Chart,
		LineController,
		LineElement,
		PointElement,
		CategoryScale,
		LinearScale,
		DoughnutController,
		ArcElement,
		Tooltip,
		Legend,
		Colors,
	} from 'chart.js';
	import { onMount } from 'svelte';

	Chart.register(
		LineController,
		LineElement,
		PointElement,
		CategoryScale,
		LinearScale,
		DoughnutController,
		ArcElement,
		Tooltip,
		Legend,
		Colors,
	);

	interface Props {
		data: {
			listUser: {
				id_numeric: number;
				id: string;
				joined: Date;
				role: 'user' | 'admin' | 'banned' | 'editor' | 'adder' | 'moderator';
				username: string;
			};
			readPerMonth: {
				date: string;
				count: number;
			}[];
			labelCounts: UserLabel[];
			seriesLabelCounts: UserLabel[];
		};
	}

	let { data }: Props = $props();

	function createChart(node: HTMLCanvasElement | null) {
		if (!node) {
			return null;
		}
		const chart = new Chart(node, {
			type: 'line',
			data: {
				labels: data.readPerMonth.map((v) => v.date.replace(/-01$/, '')),
				datasets: [
					{
						label: 'Books read',
						data: data.readPerMonth.map((v) => v.count),
					},
				],
			},
			options: {
				maintainAspectRatio: false,
				scales: {
					y: {
						min: 0,
						ticks: {
							precision: 0,
						},
					},
				},
			},
		});
		return chart;
	}

	function createPieChart(node: HTMLCanvasElement | null, data: UserLabel[], label: string) {
		if (!node) {
			return null;
		}
		const chart = new Chart(node, {
			type: 'doughnut',
			data: {
				labels: data.map((v) => v.label),
				datasets: [
					{
						label: label,
						data: data.map((v) => v.count),
					},
				],
			},
			options: {
				maintainAspectRatio: false,
			},
		});

		return chart;
	}

	function setLineChartColors(
		chart: Chart | undefined | null,
		colors: {
			axisColor: string;
			gridColor: string;
		},
	) {
		if (!chart) {
			return;
		}
		chart.options.scales!.x!.ticks!.color = colors.axisColor;
		chart.options.scales!.y!.ticks!.color = colors.axisColor;
		chart.options.scales!.x!.grid!.color = colors.gridColor;
		chart.options.scales!.y!.grid!.color = colors.gridColor;
		chart.options.plugins!.legend!.labels!.color = colors.axisColor;
		chart.update();
	}
	function setBarChartColors(
		chart: Chart<'doughnut', (string | number | bigint)[], string> | undefined | null,
		colors: {
			axisColor: string;
			gridColor: string;
		},
	) {
		if (!chart) {
			return;
		}
		chart.options.plugins!.legend!.labels!.color = colors.axisColor;
		chart.update();
	}

	const theme = getThemeContext();
	let booksByStatusChart: HTMLCanvasElement | null = $state(null);
	let seriesByStatusChart: HTMLCanvasElement | null = $state(null);
	let booksPerMonthCanvas: HTMLCanvasElement | null = $state(null);
	let pastYearReadCountChart: Chart | undefined | null = $state(null);
	let labelChart: Chart<'doughnut', (string | number | bigint)[], string> | undefined | null =
		$state(null);
	let seriesLabelChart: Chart<'doughnut', (string | number | bigint)[], string> | undefined | null =
		$state(null);
	let chartsLoaded = $state(false);

	onMount(() => {
		labelChart = createPieChart(booksByStatusChart, data.labelCounts, 'Books read');
		seriesLabelChart = createPieChart(seriesByStatusChart, data.seriesLabelCounts, 'Series read');
		pastYearReadCountChart = createChart(booksPerMonthCanvas);
		chartsLoaded = true;

		return () => {
			labelChart?.destroy();
			seriesLabelChart?.destroy();
			pastYearReadCountChart?.destroy();
		};
	});

	$effect(() => {
		if (browser && chartsLoaded) {
			const darkColors = {
				axisColor: '#ccc',
				gridColor: '#404040',
			};
			const lightColors = { axisColor: '#666', gridColor: '#e3e3e3' };
			if ($theme === 'dark') {
				setLineChartColors(pastYearReadCountChart, darkColors);
				setBarChartColors(labelChart, darkColors);
				setBarChartColors(seriesLabelChart, darkColors);
			} else if ($theme === 'light') {
				setLineChartColors(pastYearReadCountChart, lightColors);
				setBarChartColors(labelChart, lightColors);
				setBarChartColors(seriesLabelChart, lightColors);
			}
		}
	});
</script>

<DbRouteShell theme={$theme} bgImageStyle={null}>
	<DbItemShellUser user={data.listUser}>
		<main class="flex flex-col gap-4">
			<dl>
				<div>
					<dt>Joined</dt>
					<dd>{new Date(data.listUser.joined).toLocaleDateString('sv')}</dd>
					<dt>Role</dt>
					<dd>{data.listUser.role}</dd>
				</div>
			</dl>

			<div class="flex flex-col gap-2">
				<div class="w-fit flex flex-wrap gap-4">
					<LinkBox display="Reading list" href="/user/{data.listUser.id_numeric}/list" />
					<LinkBox display="Edit history" href="/user/{data.listUser.id_numeric}/history" />
					<LinkBox
						display="Upcoming releases"
						href="/user/{data.listUser.id_numeric}/list/upcoming"
					/>
				</div>
				<div class="w-fit flex flex-wrap gap-4">
					<LinkBox display="Book reviews" href="/user/{data.listUser.id_numeric}/reviews/books" />
					<LinkBox
						display="Series reviews"
						href="/user/{data.listUser.id_numeric}/reviews/series"
					/>
				</div>
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-x--2 gap-y-4">
				{#if data.labelCounts.reduce((a, { count }) => a + Number(count), 0) > 0}
					<section>
						<h2 class="font-bold text-lg">Books by reading status:</h2>

						<div class="chart-container">
							<canvas bind:this={booksByStatusChart}>
								<table>
									<caption>Books by reading status</caption>
									<thead>
										<tr>
											<th>Reading status</th>
											<th>Count</th>
										</tr>
									</thead>
									<tbody>
										{#each data.labelCounts as row}
											<tr>
												<th>{row.label}</th>
												<td>{row.count}</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</canvas>
						</div>
					</section>
				{/if}

				{#if data.seriesLabelCounts.reduce((a, { count }) => a + Number(count), 0) > 0}
					<section>
						<h2 class="font-bold text-lg">Series by reading status:</h2>

						<div class="chart-container">
							<canvas bind:this={seriesByStatusChart}>
								<table>
									<caption>Series by reading status</caption>
									<thead>
										<tr>
											<th>Reading status</th>
											<th>Count</th>
										</tr>
									</thead>
									<tbody>
										{#each data.labelCounts as row}
											<tr>
												<th>{row.label}</th>
												<td>{row.count}</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</canvas>
						</div>
					</section>
				{/if}

				<section>
					<h2 class="font-bold text-lg">Number of books read in the last 12 months by month:</h2>

					<div class="chart-container">
						<canvas bind:this={booksPerMonthCanvas}>
							<table>
								<caption>Number of books read in the last 12 months by month</caption>
								<thead>
									<tr>
										<th>Year and month</th>
										<th>Count</th>
									</tr>
								</thead>
								<tbody>
									{#each data.readPerMonth as row}
										<tr>
											<th>{row.date}</th>
											<td>{row.count}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</canvas>
					</div>
				</section>
			</div>
		</main>
	</DbItemShellUser>
</DbRouteShell>

<style>
	.chart-container {
		position: relative;
		height: 300px;
		width: 100%;
	}

	dl > div {
		display: grid;
		grid-template-columns: 100px 1fr;
	}

	dt {
		font-weight: 700;
	}
</style>
