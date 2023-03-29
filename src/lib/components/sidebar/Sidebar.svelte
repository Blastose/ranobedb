<script lang="ts">
	import SidebarItem from '$lib/components/sidebar/SidebarItem.svelte';
	import SidebarHeading from '$lib/components/sidebar/SidebarHeading.svelte';
	import SidebarCloseButton from '$lib/components/sidebar/SidebarCloseButton.svelte';
	import focusSidebar from '$lib/stores/focusSidebar';
	import { browser } from '$app/environment';

	export let tabindex: boolean;
	export let user: Lucia.UserAttributes | null;
	let closeBtn: SidebarCloseButton;

	$: if (browser && $focusSidebar) {
		closeBtn.focus();
		focusSidebar.set(false);
	}
</script>

<div class="sidebar">
	<nav class="flex flex-col gap-2 px-4 py-4">
		<div class="flex justify-end">
			<SidebarCloseButton {tabindex} bind:this={closeBtn} />
		</div>
		<ul>
			<SidebarItem text={'Home'} href={'/'} heading={true} icon={'home'} {tabindex} />
		</ul>
		{#if user}
			<div>
				<SidebarHeading text={user.username} icon={'profile'} />
				<ul>
					<SidebarItem text={'My List'} href={'/my-list'} {tabindex} />
					<SidebarItem text={'My Profile'} href={'/profile'} {tabindex} />
					<li class="sidebar-item">
						<form method="POST" action="/signout">
							<button class="w-full" type="submit" tabindex={tabindex ? 0 : -1}>
								<p class="text-left px-4 py-1">Sign Out</p>
							</button>
						</form>
					</li>
				</ul>
			</div>
		{:else}
			<div>
				<SidebarHeading text={'User'} icon={'profile'} />
				<ul>
					<SidebarItem text={'Log In'} href={'/login'} {tabindex} />
					<SidebarItem text={'Sign Up'} href={'/signup'} {tabindex} />
				</ul>
			</div>
		{/if}
		<div>
			<SidebarHeading text={'Database'} icon={'database'} />
			<ul>
				<SidebarItem text={'Books'} href={'/books'} {tabindex} />
				<SidebarItem text={'Series'} href={'/series'} {tabindex} />
				<SidebarItem text={'Releases'} href={'/releases'} {tabindex} />
				<SidebarItem text={'People'} href={'/people'} {tabindex} />
				<SidebarItem text={'Publishers'} href={'/publishers'} {tabindex} />
				<SidebarItem text={'Add to database'} href={'/add-to-database'} {tabindex} />
			</ul>
		</div>
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
