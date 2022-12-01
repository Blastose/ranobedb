<script lang="ts">
	import './sidebar.css';
	import SidebarItem from '$lib/components/sidebar/SidebarItem.svelte';
	import SidebarHeading from '$lib/components/sidebar/SidebarHeading.svelte';
	import SidebarCloseButton from '$lib/components/sidebar/SidebarCloseButton.svelte';
	import { onMount } from 'svelte';
	import focusSidebar from '$lib/stores/focusSidebar';
	import { getUser } from '@lucia-auth/sveltekit/client';

	export let tabindex: boolean;
	let closeBtn: SidebarCloseButton;
	const user = getUser();

	onMount(() => {
		const focusSidebarCloseButton = (e: KeyboardEvent) => {
			if (e.key === 'Tab' && $focusSidebar) {
				e.preventDefault();
				if (closeBtn.focus) {
					closeBtn.focus();
				}
				focusSidebar.set(false);
			}
		};
		document.addEventListener('keydown', focusSidebarCloseButton);

		return () => {
			document.removeEventListener('keydown', focusSidebarCloseButton);
		};
	});
</script>

<div class="sidebar">
	<nav class="flex flex-col gap-2 px-4 py-4">
		<div class="flex justify-end">
			<SidebarCloseButton {tabindex} bind:this={closeBtn} />
		</div>
		<ul>
			<SidebarItem text={'Home'} href={'/'} heading={true} icon={'home'} {tabindex} />
		</ul>
		{#if $user}
			<ul>
				<SidebarHeading text={$user.username} icon={'profile'} />
				<SidebarItem text={'My List'} href={'/my-list'} {tabindex} />
				<SidebarItem text={'My Profile'} href={'/profile'} {tabindex} />
				<li class="sidebar-item">
					<form method="POST" action="/signout">
						<button class="w-full" type="submit">
							<p class="text-left px-4 py-1">Sign Out</p>
						</button>
					</form>
				</li>
			</ul>
		{:else}
			<ul>
				<SidebarHeading text={'User'} icon={'profile'} />
				<SidebarItem text={'Log In'} href={'/login'} {tabindex} />
				<SidebarItem text={'Sign Up'} href={'/signup'} {tabindex} />
			</ul>
		{/if}
		<ul>
			<SidebarHeading text={'Database'} icon={'database'} />
			<SidebarItem text={'Books'} href={'/books'} {tabindex} />
			<SidebarItem text={'Series'} href={'/series'} {tabindex} />
		</ul>
	</nav>
</div>

<style>
	.sidebar {
		background-color: var(--primary-100);
		width: 16rem;
		height: 100vh;
		position: fixed;
		z-index: 50;
		overflow-x: auto;
	}

	@media (min-width: 1024px) {
		.sidebar {
			position: sticky;
			top: 0;
		}
	}

	:global(.dark) .sidebar {
		background-color: var(--dark-550);
	}
</style>
