const { fontFamily } = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ["class"],
	content: ["./src/**/*.{js,jsx}"],
	theme: {
		container: {
			center: true,
			padding: "2rem",
			screens: {
				"2xl": "1400px",
				xs: "384px",
			},
		},
		extend: {
			colors: {
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				primary: {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},
				"y-black": "#060000ff",
				"y-grey": "#383838ff",
				"y-darkgreen": "#395b50ff",
				"y-green": "#87a878ff",
				"y-white": "#ecebebff",
				"y-brown": "#5c5346ff",
				"y-red": "#BF8B85ff",
			},
			borderRadius: {
				lg: `var(--radius)`,
				md: `calc(var(--radius) - 2px)`,
				sm: "calc(var(--radius) - 4px)",
			},
			fontFamily: {
				// sans: ["var(--font-sans)", ...fontFamily.sans],
				heading: ["Bitter", "serif"],
				content: ["Bitter", "serif"],
			},
			fontSize: {
				"step--2": "clamp(0.85rem, 1rem + -0.4vw, 0.64rem)",
				"step--1": "clamp(1.05rem, 1.15rem + -0.5vw, 0.8rem)",
				"step-0": "clamp(1.13rem, 1.17rem + -0.24vw, 1rem)",
				"step-1": "clamp(1.2rem, 1.18rem + 0.1vw, 1.25rem)",
				"step-2": "clamp(1.28rem, 1.17rem + 0.55vw, 1.56rem)",
				"step-3": "clamp(1.37rem, 1.14rem + 1.14vw, 1.95rem)",
				"step-4": "clamp(1.46rem, 1.07rem + 1.92vw, 2.44rem)",
				"step-5": "clamp(1.56rem, 0.97rem + 2.92vw, 3.05rem)",
				"step-6": "clamp(1.66rem, 0.82rem + 4.2vw, 3.82rem)",
				"step-7": "clamp(1.77rem, 0.6rem + 5.85vw, 4.77rem)",
				"step-8": "clamp(1.89rem, 0.3rem + 7.94vw, 5.96rem)",
				"step-9": "clamp(2.02rem, -0.1rem + 10.6vw, 7.45rem)",
				"step-10": "clamp(2.6rem, -0.44rem + 12.4vw, 13rem)",
				"step-11": "clamp(3.4rem, -0.44rem + 13.4vw, 16rem)",
				"step-12": "clamp(4.1rem, -0.44rem + 14.4vw, 20rem)",
			},
			keyframes: {
				"accordion-down": {
					from: { height: "0" },
					to: { height: "var(--radix-accordion-content-height)" },
				},
				"accordion-up": {
					from: { height: "var(--radix-accordion-content-height)" },
					to: { height: "0" },
				},
				"caret-blink": {
					"0%,70%,100%": { opacity: "1" },
					"20%,50%": { opacity: "0" },
				},
			},
			animation: {
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
				"caret-blink": "caret-blink 1.25s ease-out infinite",
			},
		},
	},
	plugins: [require("tailwindcss-animate"), require("tailwind-scrollbar")],
};
