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
				},
				dark: {
					200: '#545555',
					300: '#505152',
					400: '#434446',
					500: '#38393A',
					600: '#272829',
					700: '#212224'
				}
			}
		}
	},
	plugins: []
};
