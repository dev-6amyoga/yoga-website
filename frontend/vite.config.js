import react from "@vitejs/plugin-react";
import { defineConfig, transformWithEsbuild } from "vite";
import solidPlugin from "vite-plugin-solid";

export default defineConfig({
	plugins: [
		{
			name: "treat-js-files-as-jsx",
			async transform(code, id) {
				if (!id.match(/src\/.*\.js$/)) return null;

				if (id.match(/src\/solidjs-src\/src\/.*\.js$/)) {
					return transformWithEsbuild(code, id, {
						loader: "jsx",
						jsx: "preserve",
					});
				}

				if (id.match(/node_modules\/@thisbeyond\/solid-dnd\/.*\.js$/)) {
					return transformWithEsbuild(code, id, {
						loader: "jsx",
						jsx: "preserve",
					});
				}

				// Use the exposed transform from vite, instead of directly
				// transforming with esbuild
				return transformWithEsbuild(code, id, {
					loader: "jsx",
					jsx: "automatic",
				});
			},
		},
		react(),
		solidPlugin({
			include: [
				"src/solidjs-src/src/**/**/**/**/*.jsx",
				"src/solidjs-src/src/**/**/**/**/*.js",
			],
		}),
	],

	optimizeDeps: {
		force: true,
		esbuildOptions: {
			loader: {
				".js": "jsx",
			},
		},
	},
});
