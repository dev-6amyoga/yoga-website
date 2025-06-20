/** @type {import('tailwindcss').Config} */
const { fontFamily } = require("tailwindcss/defaultTheme");
import colors from "tailwindcss/colors";

module.exports = {
	darkMode: ["class"],
	content: [
		"./src/**/*.{js,jsx}",
		"./node_modules/@tremor/**/*.{js,ts,jsx,tsx}",
	],
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

				tremor: {
					brand: {
						faint: colors.blue[50],
						muted: colors.blue[200],
						subtle: colors.blue[400],
						DEFAULT: colors.blue[500],
						emphasis: colors.blue[700],
						inverted: colors.white,
					},
					background: {
						muted: colors.gray[50],
						subtle: colors.gray[100],
						DEFAULT: colors.white,
						emphasis: colors.gray[700],
					},
					border: {
						DEFAULT: colors.gray[200],
					},
					ring: {
						DEFAULT: colors.gray[200],
					},
					content: {
						subtle: colors.gray[400],
						DEFAULT: colors.gray[500],
						emphasis: colors.gray[700],
						strong: colors.gray[900],
						inverted: colors.white,
					},
				},
				// dark mode
				"dark-tremor": {
					brand: {
						faint: "#0B1229",
						muted: colors.blue[950],
						subtle: colors.blue[800],
						DEFAULT: colors.blue[500],
						emphasis: colors.blue[400],
						inverted: colors.blue[950],
					},
					background: {
						muted: "#131A2B",
						subtle: colors.gray[800],
						DEFAULT: colors.gray[900],
						emphasis: colors.gray[300],
					},
					border: {
						DEFAULT: colors.gray[800],
					},
					ring: {
						DEFAULT: colors.gray[800],
					},
					content: {
						subtle: colors.gray[600],
						DEFAULT: colors.gray[500],
						emphasis: colors.gray[200],
						strong: colors.gray[50],
						inverted: colors.gray[950],
					},
				},
			},
			borderRadius: {
				lg: `var(--radius)`,
				md: `calc(var(--radius) - 2px)`,
				sm: "calc(var(--radius) - 4px)",
				"tremor-small": "0.375rem",
				"tremor-default": "0.5rem",
				"tremor-full": "9999px",
			},

			boxShadow: {
				// light
				"tremor-input": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
				"tremor-card":
					"0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
				"tremor-dropdown":
					"0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
				// dark
				"dark-tremor-input": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
				"dark-tremor-card":
					"0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
				"dark-tremor-dropdown":
					"0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
			},
			fontFamily: {
				// sans: ["var(--font-sans)", ...fontFamily.sans],
				heading: ["Roboto", "sans-serif"],
				content: ["Roboto", "sans-serif"],
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
				"tremor-label": ["0.75rem", { lineHeight: "1rem" }],
				"tremor-default": ["0.875rem", { lineHeight: "1.25rem" }],
				"tremor-title": ["1.125rem", { lineHeight: "1.75rem" }],
				"tremor-metric": ["1.875rem", { lineHeight: "2.25rem" }],
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
	safelist: [
		{
			pattern:
				/^(bg-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
			variants: ["hover", "ui-selected"],
		},
		{
			pattern:
				/^(text-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
			variants: ["hover", "ui-selected"],
		},
		{
			pattern:
				/^(border-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
			variants: ["hover", "ui-selected"],
		},
		{
			pattern:
				/^(ring-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
		},
		{
			pattern:
				/^(stroke-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
		},
		{
			pattern:
				/^(fill-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
		},
	],
	plugins: [
		require("tailwindcss-animate"),
		require("tailwind-scrollbar"),
		require("@headlessui/tailwindcss"),
	],
};
