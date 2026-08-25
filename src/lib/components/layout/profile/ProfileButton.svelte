<script lang="ts">
	import { DropdownMenu } from 'bits-ui';
	import type { User } from '$lib/server/lucia/lucia';
	import { fly } from 'svelte/transition';
	import Icon from '$lib/components/icon/Icon.svelte';
	import ProfileItem from './ProfileItem.svelte';
	import ProfileFormButton from './ProfileFormButton.svelte';
	import Hr from '../Hr.svelte';
	import { buildAvatarImageUrl } from '$lib/components/book/book';

	interface Props {
		user: User | null;
	}

	let { user }: Props = $props();
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<button {...props} class="profile-button" class:logged-in={user} aria-label="Open profile">
				{#if user}
					{#if user.profile_image_filename}
						{#key user.profile_image_filename}
							<img src={buildAvatarImageUrl(user.profile_image_filename)} alt="" />
						{/key}
					{:else}
						{user.username.at(0)}
					{/if}
				{:else}
					<Icon name="profile" />
				{/if}
			</button>
		{/snippet}
	</DropdownMenu.Trigger>

	<DropdownMenu.Portal>
		<DropdownMenu.Content forceMount side="bottom" align="end" sideOffset={16}>
			{#snippet child({ wrapperProps, props, open: contentOpen })}
				{#if contentOpen}
					<div {...wrapperProps}>
						<div {...props} class="profile-menu" transition:fly={{ duration: 150, y: -10 }}>
							{#if user}
								<DropdownMenu.Item>
									{#snippet child({ props: itemProps })}
										<a href="/user/{user.id_numeric}" class="flex items-center px-2" {...itemProps}>
											<div class="profile-button" class:logged-in={user}>
												{#if user.profile_image_filename}
													{#key user.profile_image_filename}
														<img src={buildAvatarImageUrl(user.profile_image_filename)} alt="" />
													{/key}
												{:else}
													{user.username.at(0)}
												{/if}
											</div>
											<h2 class="p-2 text-lg font-semibold">{user.username}</h2>
										</a>
									{/snippet}
								</DropdownMenu.Item>

								<Hr />
								<nav>
									<ul class="flex flex-col gap-2">
										<li>
											<ProfileItem href="/user/{user.id_numeric}/list" text="My List">
												<Icon name="bookMultiple" />
											</ProfileItem>
										</li>
										<li>
											<ProfileItem href="/user/{user.id_numeric}/list/upcoming" text="Upcoming">
												<Icon name="calendar" />
											</ProfileItem>
										</li>
										<li>
											<ProfileItem href="/user/{user.id_numeric}" text="Profile">
												<Icon name="profile" />
											</ProfileItem>
										</li>
										<li>
											<ProfileItem href="/settings" text="Settings">
												<Icon name="settings" />
											</ProfileItem>
										</li>
										<Hr />
										<li>
											<ProfileFormButton action="/logout" text="Sign out">
												<Icon name="logout" />
											</ProfileFormButton>
										</li>
									</ul>
								</nav>
							{:else}
								<nav>
									<ul class="flex flex-col gap-2">
										<li>
											<ProfileItem href="/login" text="Log in">
												<Icon name="login" />
											</ProfileItem>
										</li>
										<li>
											<ProfileItem href="/signup" text="Sign up">
												<Icon name="signup" />
											</ProfileItem>
										</li>
										<Hr />
										<li>
											<ProfileItem href="/settings" text="Settings">
												<Icon name="settings" />
											</ProfileItem>
										</li>
									</ul>
								</nav>
							{/if}
						</div>
					</div>
				{/if}
			{/snippet}
		</DropdownMenu.Content>
	</DropdownMenu.Portal>
</DropdownMenu.Root>

<style>
	:global(.profile-button) {
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 9999px;
		width: 2.5rem;
		height: 2.5rem;
		color: var(--text-light);
		background-color: var(--primary-200);
		font-size: 1.125rem;
		line-height: 1.75rem;
		font-weight: 700;
		overflow: hidden;
	}

	.profile-button.logged-in {
		background-color: var(--primary-500);
		color: var(--text-dark);
	}

	:global(.profile-button.profile-button:has(img)) {
		background-color: white;
	}
	:global(.profile-button.profile-button.logged-in:has(img)) {
		background-color: white;
	}

	.profile-menu {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		width: 16rem;
		background-color: var(--bg-light1);
		border-radius: 0.375rem;
		overflow: hidden;
		padding: 0.5rem;
		z-index: 10;
	}

	:global(.dark) .profile-menu {
		background-color: var(--bg-dark1);
	}
</style>
