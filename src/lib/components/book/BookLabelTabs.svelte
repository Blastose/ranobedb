<script lang="ts">
	import { page } from '$app/stores';

	let index = 0;
	// Tabs widths are from getBoundingClientRect().width and need to change
	// if the tab contents/padding changes
	let tabs = [
		{ name: 'All', width: 43.116668701171875 },
		{ name: 'Reading', width: 83.16667175292969 },
		{ name: 'Plan to read', width: 111.51666259765625 },
		{ name: 'Finished', width: 84.08332824707031 },
		{ name: 'Dropped', width: 88.2166748046875 }
	];

	$: activeItem = $page.url.searchParams.get('q') ?? 'All';

	// Set index from url search params
	index = tabs.findIndex((tab) => tab.name === $page.url.searchParams.get('q'));
	index = index !== -1 ? index : 0;

	$: {
		index = tabs.findIndex((tab) => tab.name === activeItem);
		index = index !== -1 ? index : 0;
	}

	const sumArray = (arr: { width: number }[], numElements: number) => {
		let sumWidth = 0;
		for (let i = 0; i < numElements; i++) {
			sumWidth += arr[i].width;
		}
		return sumWidth;
	};
	$: leftOffset = sumArray(tabs, index);

	const setWidths = (node: HTMLDivElement) => {
		const buttons = node.querySelectorAll('a');
		buttons.forEach((b, index) => {
			tabs[index].width = b.getBoundingClientRect().width;
		});
	};

	let divContainer: HTMLDivElement;
</script>

<div class="grid">
	<div class="tab-container-wrapper">
		<div bind:this={divContainer} use:setWidths class="tab-container">
			<div class="highlight" style="left: {leftOffset}px; width: {tabs[index].width}px;" />

			{#each tabs as tab, i}
				<a
					href="?q={tab.name}"
					class="tab {index === i ? 'active' : ''}"
					on:click={() => {
						setWidths(divContainer);
						index = i;
						divContainer.scrollTo({ left: sumArray(tabs, index), behavior: 'smooth' });
					}}
				>
					{tab.name}
				</a>
			{/each}
		</div>
	</div>
</div>

<style>
	.tab-container-wrapper {
		display: flex;
		overflow-x: auto;
		align-items: center;
		justify-content: space-between;
		white-space: nowrap;
	}

	.tab-container {
		background-color: var(--primary-200);
		display: grid;
		grid-auto-flow: column;
		overflow-x: auto;
		position: relative;
		transition-duration: 150ms;
	}

	:global(.dark) .tab-container {
		background-color: var(--dark-200);
	}

	.highlight {
		position: absolute;
		transition-duration: 300ms;
		background-color: var(--primary-500);
		height: 40px;
	}

	.tab {
		position: relative;
		font-weight: 600;
		transition-duration: 300ms;
		padding: 0.5rem 0.75rem;
	}

	.tab:not(.active):hover {
		background-color: var(--primary-300);
	}

	:global(.dark) .tab:not(.active):hover {
		background-color: var(--dark-500);
	}

	.tab.active {
		color: white;
	}
</style>
