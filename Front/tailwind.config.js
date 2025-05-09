/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./index.html", "./profile.html", "./home.html", "./ranking.html", "./settings.html", "./users/html", "./src/**/*.{js,ts}"],
	theme: {
		extend: {
			colors: {
				background: '#383568',
			  },
			  fontFamily: {
				  spartan: ['"League Spartan"', 'sans-serif'],
			  },
		  },
	},
	plugins: [],
}