// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace Lucia {
		type Auth = import('$lib/server/lucia').Auth;
		type DatabaseUserAttributes = {
			username: string;
			role: import('$lib/server/dbTypes').UserRole;
		};
		type DatabaseSessionAttributes = object;
	}

	namespace App {
		// interface Error {}
		interface Locals {
			auth: import('lucia').AuthRequest;
			user: import('lucia').User | undefined;
		}
		// interface PageData {}
		// interface Platform {}
		namespace Superforms {
			type Message = {
				type: 'error' | 'success' | 'warning';
				text: string;
			};
		}
	}

	interface Document {
		startViewTransition(updateCallback: () => Promise<void>): ViewTransition;
	}
}

export {};
