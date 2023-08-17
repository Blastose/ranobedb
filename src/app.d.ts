/// <reference types="lucia-auth" />
declare namespace Lucia {
	type Auth = import('$lib/server/lucia.js').Auth;
	type DatabaseUserAttributes = {
		username: string;
		role: 'admin' | 'moderator' | 'user';
		reader_id: number;
	};
}

/// <reference types="@sveltejs/kit" />
declare namespace App {
	interface Locals {
		auth: import('lucia').AuthRequest;
	}
}

declare namespace svelteHTML {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	interface HTMLAttributes<T> {
		'on:outclick'?: () => void;
	}
}
