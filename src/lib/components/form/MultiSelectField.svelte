<script lang="ts" module>
	type Rec = Record<string, unknown>;
</script>

<script lang="ts" generics="T extends Rec">
	import { fly } from 'svelte/transition';
	import { onDestroy } from 'svelte';
	import { useId, Portal } from 'bits-ui';
	import { autoUpdate, computePosition, offset, flip, shift, size } from '@floating-ui/dom';
	import { type SuperForm, arrayProxy, type FormPathArrays } from 'sveltekit-superforms';
	import Icon from '../icon/Icon.svelte';
	import HiddenInput from './HiddenInput.svelte';
	import type { Writable } from 'svelte/store';

	type DropdownOption = { display: string; value: string | number };
	let {
		form,
		field,
		labelText = '',
		dropdownOptions,
		allSelectedText,
		noneSelectedText = undefined,
	}: {
		form: SuperForm<T, App.Superforms.Message>;
		field: FormPathArrays<T>;
		labelText: string;
		dropdownOptions: ReadonlyArray<DropdownOption>;
		allSelectedText: string | undefined;
		noneSelectedText: string | undefined;
	} = $props();

	const triggerId = useId('multiselect-trigger');
	const menuId = useId('multiselect-menu');

	// svelte-ignore state_referenced_locally
	let { values } = arrayProxy(form, field) as {
		values: Writable<(string | number)[]>;
	};

	let selectedValues = $derived($values.map((v) => String(v)));

	let selectedDisplay = $derived(
		dropdownOptions.filter((v) => selectedValues.includes(String(v.value))),
	);

	let open = $state(false);
	let highlightedIndex = $state(-1);

	let triggerEl = $state<HTMLButtonElement | null>(null);
	let menuEl = $state<HTMLDivElement | null>(null);
	let wrapperEl = $state<HTMLDivElement | null>(null);

	function getPortalTarget(): HTMLElement | undefined {
		if (typeof document === 'undefined') return undefined;
		let el: HTMLElement | null = wrapperEl;
		while (el) {
			if (el.classList.contains('modal-content')) return el;
			if (el.tagName === 'DIALOG' || el.getAttribute('role') === 'dialog') {
				return el.parentElement ?? el;
			}
			el = el.parentElement;
		}
		return document.body;
	}

	let portalTarget = $derived(getPortalTarget());

	function updatePosition() {
		if (!triggerEl || !menuEl) return;
		computePosition(triggerEl, menuEl, {
			placement: 'bottom',
			strategy: 'fixed',
			middleware: [
				offset(4),
				flip({ boundary: document.documentElement }),
				shift({ boundary: document.documentElement, padding: 8 }),
				size({
					boundary: document.documentElement,
					padding: 8,
					apply({ rects, elements, availableHeight }) {
						Object.assign(elements.floating.style, {
							width: `${rects.reference.width}px`,
							maxHeight: `${availableHeight}px`,
						});
					},
				}),
			],
		}).then(({ x, y }) => {
			if (!menuEl) return;
			Object.assign(menuEl.style, {
				position: 'fixed',
				left: `${x}px`,
				top: `${y}px`,
			});
		});
	}

	$effect(() => {
		if (open && triggerEl && menuEl) {
			const cleanup = autoUpdate(triggerEl, menuEl, updatePosition);
			return () => cleanup();
		}
	});

	function scrollToHighlighted() {
		requestAnimationFrame(() => {
			const el = menuEl?.querySelector('[data-highlighted]');
			if (el instanceof HTMLElement) el.scrollIntoView({ block: 'nearest' });
		});
	}

	function pageStep(): number {
		if (!menuEl) return 10;
		const first = menuEl.querySelector('[role="option"]') as HTMLElement | null;
		const itemH = first?.offsetHeight || 32;
		return Math.max(1, Math.floor(menuEl.clientHeight / itemH));
	}

	function setOpen(next: boolean) {
		open = next;
		if (next) {
			const firstSel = dropdownOptions.findIndex((o) => selectedValues.includes(String(o.value)));
			highlightedIndex = firstSel >= 0 ? firstSel : 0;
		} else {
			highlightedIndex = -1;
			triggerEl?.focus();
		}
	}

	function toggleValue(val: string) {
		const next = selectedValues.includes(val)
			? selectedValues.filter((v) => v !== val)
			: [...selectedValues, val];
		$values = next.map((v) => {
			const num = Number(v);
			return isNaN(num) ? v : num;
		}) as typeof $values;
	}

	function toggleOption(i: number) {
		const opt = dropdownOptions[i];
		if (!opt) return;
		highlightedIndex = i;
		toggleValue(String(opt.value));
	}

	function handleMenuKey(e: KeyboardEvent) {
		const len = dropdownOptions.length;
		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				highlightedIndex = highlightedIndex < 0 ? 0 : (highlightedIndex + 1) % len;
				scrollToHighlighted();
				break;
			case 'ArrowUp':
				e.preventDefault();
				highlightedIndex = highlightedIndex < 0 ? len - 1 : (highlightedIndex - 1 + len) % len;
				scrollToHighlighted();
				break;
			case 'Home':
				e.preventDefault();
				highlightedIndex = 0;
				scrollToHighlighted();
				break;
			case 'End':
				e.preventDefault();
				highlightedIndex = len - 1;
				scrollToHighlighted();
				break;
			case 'PageDown':
				e.preventDefault();
				highlightedIndex = Math.min(len - 1, highlightedIndex + pageStep());
				scrollToHighlighted();
				break;
			case 'PageUp':
				e.preventDefault();
				highlightedIndex = Math.max(0, highlightedIndex - pageStep());
				scrollToHighlighted();
				break;
			case 'Enter':
			case ' ':
				e.preventDefault();
				toggleOption(highlightedIndex);
				break;
			case 'Escape':
				e.preventDefault();
				setOpen(false);
				break;
			case 'Tab':
				e.preventDefault();
				setOpen(false);
				break;
			default:
				if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
					typeahead(e.key);
				}
				break;
		}
	}

	function onTriggerKeydown(e: KeyboardEvent) {
		if (!open) {
			if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				setOpen(true);
			}
			return;
		}
		handleMenuKey(e);
	}

	let typeaheadBuffer = '';
	let typeaheadTimer: ReturnType<typeof setTimeout> | undefined;
	function typeahead(char: string) {
		typeaheadBuffer += char.toLowerCase();
		clearTimeout(typeaheadTimer);
		typeaheadTimer = setTimeout(() => (typeaheadBuffer = ''), 500);
		const idx = dropdownOptions.findIndex((o) =>
			String(o.display).toLowerCase().startsWith(typeaheadBuffer),
		);
		if (idx >= 0) {
			highlightedIndex = idx;
			scrollToHighlighted();
		}
	}
	onDestroy(() => clearTimeout(typeaheadTimer));

	function onPointerDown(e: PointerEvent) {
		if (!open) return;
		const target = e.target as Node;
		if (wrapperEl && wrapperEl.contains(target)) return;
		if (menuEl && menuEl.contains(target)) return;
		setOpen(false);
	}
</script>

<svelte:document onpointerdown={onPointerDown} />

{#each $values as sel}
	<HiddenInput name={field} value={sel} />
{/each}

<div
	class="multiselect-wrapper relative flex flex-col gap-1 whitespace-nowrap"
	bind:this={wrapperEl}
>
	<label for={triggerId}>{labelText}</label>
	<button
		id={triggerId}
		type="button"
		role="combobox"
		bind:this={triggerEl}
		class="input round multiselect-padding flex items-center justify-between"
		aria-haspopup="listbox"
		aria-expanded={open}
		aria-controls={menuId}
		aria-activedescendant={highlightedIndex >= 0 ? `${menuId}-opt-${highlightedIndex}` : undefined}
		aria-label={labelText || 'Options'}
		onclick={() => setOpen(!open)}
		onkeydown={onTriggerKeydown}
	>
		<span class="flex min-w-[220px] flex-wrap gap-2">
			{#if selectedValues.length === 0}
				<span class="chip">{noneSelectedText ?? allSelectedText ?? 'None'}</span>
			{:else if selectedValues.length === dropdownOptions.length && allSelectedText !== undefined}
				<span class="chip">{allSelectedText}</span>
			{:else if selectedValues.length <= 2}
				{#each selectedDisplay as item}
					<span class="chip">{item.display}</span>
				{/each}
			{:else}
				<span class="chip">{selectedDisplay[0].display}</span>
				{#if selectedValues.length > 1}
					<span class="chip">+{selectedValues.length - 1} more</span>
				{/if}
			{/if}
		</span>
		<Icon name="chevronDown" />
	</button>

	<Portal to={portalTarget}>
		{#if open}
			<!-- svelte-ignore a11y_interactive_supports_focus -->
			<div
				bind:this={menuEl}
				id={menuId}
				role="listbox"
				aria-multiselectable="true"
				aria-label={labelText || 'Options'}
				class="input multiselect-popup z-[999999] flex flex-col gap-1 overflow-y-auto overflow-x-hidden whitespace-nowrap rounded-lg p-1 ring-1 ring-[#c2c1ca] dark:ring-[#686775]"
				style="position:fixed; max-height:80vh; pointer-events:auto;"
				onpointerdown={(e) => e.stopPropagation()}
				onfocusin={(e) => e.stopPropagation()}
				transition:fly={{ duration: 150, y: -5 }}
			>
				{#each dropdownOptions as dropdownOption, i (i)}
					{@const selected = selectedValues.includes(String(dropdownOption.value))}
					<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_noninteractive_element_interactions -->
					<div
						id={`${menuId}-opt-${i}`}
						role="option"
						tabindex="-1"
						aria-selected={selected}
						aria-label={dropdownOption.display}
						data-highlighted={i === highlightedIndex ? true : undefined}
						data-selected={selected ? true : undefined}
						class="multiselect-option"
						onclick={() => toggleOption(i)}
						onmouseenter={() => (highlightedIndex = i)}
					>
						<div class="check {selected ? 'block' : 'hidden'}">
							<Icon name="checkCircle" width="18" height="18" />
						</div>
						{dropdownOption.display}
					</div>
				{/each}
			</div>
		{/if}
	</Portal>
</div>

<style>
	:global(.input.multiselect-padding) {
		padding: 0.125rem 0.25rem;
	}
	:global(.input.round) {
		border-radius: 9999px;
	}

	.chip {
		padding: 0 0.5rem;
		border-radius: 9999px;
		font-size: 0.875rem;
		line-height: 1.25rem;
		font-weight: 600;
		color: var(--text-dark);
		background-color: var(--primary-500);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		max-width: 96px;
	}

	.check {
		position: absolute;
		left: 0.5rem;
		top: 50%;
		z-index: 20;
		translate: 0 -50%;
	}

	.multiselect-option {
		position: relative;
		cursor: pointer;
		scroll-margin: 0.5rem;
		border-radius: 9999px;
		padding-left: 2rem;
		padding-right: 0.5rem;
	}

	.multiselect-option[data-highlighted] {
		background-color: #d1d5db;
		color: #111827;
	}

	.multiselect-option[data-selected] {
		background-color: var(--primary-500);
		color: #ffffff;
	}

	:global(.dark) .multiselect-option[data-highlighted] {
		background-color: #525252;
		color: #ffffff;
	}

	:global(.dark) .multiselect-option[data-selected] {
		background-color: var(--primary-500);
		color: #ffffff;
	}

	.multiselect-popup.input:focus {
		box-shadow: 0 0 0 1px #c2c1ca;
		outline: none;
	}

	:global(.dark) .multiselect-popup.input:focus {
		box-shadow: 0 0 0 1px #686775;
		outline: none;
	}
</style>
