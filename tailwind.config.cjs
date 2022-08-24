/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: 'class',
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				primary: {
					500: '#73739C',
					700: '#474963'
				}
			}
		}
	},
	plugins: []
};
