/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: 'class',
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				primary: {
					50: '#FAFAFA',
					100: '#E4E7EE',
					200: '#D9DBE6',
					300: '#CDCEDD',
					400: '#BBBCCE',
					500: '#73739C',
					600: '#696987',
					700: '#585975',
					800: '#474963'
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
