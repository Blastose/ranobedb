import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['src/tests/integration/**/*.{test,spec}.{js,ts}'],
		fileParallelism: false,
		hookTimeout: 20000,
	},
});
