<script lang="ts">
	import NoIndex from '$lib/components/layout/NoIndex.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';

	export let data;
</script>

<PageTitle title="Welcome" />
<NoIndex />

<main class="container-rndb flex flex-col gap-2">
	<h1 class="text-3xl font-bold">Welcome to RanobeDB!</h1>

	<div class="markdown">
		<p>
			Hello {data.user?.username},<br />
			Welcome to RanobeDB! We are thrilled to have you join our community.
		</p>

		<section>
			<h2>What's next?</h2>
			<ul>
				<li>
					<strong>Verify your email:</strong> You can verify your email by going to the
					<a href="/settings?view=email">email settings page</a> and clicking the Send verification code
					button. You will receive a code in your email that you need to input to verify your email
				</li>
				<li>
					<strong>Contribute:</strong> After you have verified your email, you can now start
					contributing to the database. Be sure to read the
					<a href="/editing-guidelines">editing guidelines</a> before you make any changes. You can
					also join the <a href="https://discord.gg/ZeAnhGncFx" target="_blank">Discord server</a> if
					you have any questions about editing
				</li>
				<li>
					<strong>Customize:</strong> On the
					<a href="/settings?view=display">display settings page</a>, you can customize the way
					RanobeDB looks. You can change the title display of books as well as the theme of the site
				</li>
				<li>
					<strong>Fill your reading list:</strong> Browse our catalog of <a href="/books">books</a> and
					add those that interest you to your reading list
				</li>
				<li><strong>Explore:</strong> Explore the database and all of the information it offers</li>
			</ul>

			<p>
				If you have any questions, you can ask us in our <a
					href="https://discord.gg/ZeAnhGncFx"
					target="_blank">Discord server</a
				>.
			</p>
		</section>
	</div>
</main>
