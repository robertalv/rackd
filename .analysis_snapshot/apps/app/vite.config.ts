import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import netlify from '@netlify/vite-plugin-tanstack-start'
import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";

export default defineConfig({
	plugins: [tsconfigPaths(), tanstackStart(), tailwindcss(), viteReact(), netlify()],
	ssr: {
		noExternal: ["@hugeicons/react"],
		// Prevent styled-components from being bundled in SSR/server functions
		// styled-components is client-only and causes "too many open files" errors in serverless
		// By not including it in noExternal, it remains external (default behavior for node_modules)
	},
	resolve: {
		// Externalize expo-related packages that shouldn't be bundled in serverless functions
		// These are only needed for native apps, not web/serverless
		conditions: ["import", "module", "browser", "default"],
	},
	optimizeDeps: {
		esbuildOptions: {
			mainFields: ["module", "main"],
		},
		// Exclude problematic packages from optimization (use string patterns)
		exclude: [
			"@better-auth/expo",
		],
	},
	build: {
		commonjsOptions: {
			transformMixedEsModules: true,
		},
		sourcemap: false, // Disable sourcemaps in production to reduce file operations
		rollupOptions: {
			// Externalize packages that shouldn't be bundled in serverless functions
			// These are only needed for native apps, not web/serverless
			external: (id) => {
				// Only externalize if it's clearly an expo/native-only package
				// Be conservative to avoid runtime errors
				if (
					id === '@better-auth/expo' ||
					id.startsWith('@expo/') ||
					(id.startsWith('expo') && !id.includes('expo-'))
				) {
					return true;
				}
				return false;
			},
			output: {
				// Let Vite handle chunking automatically to optimize bundle size
				manualChunks: undefined,
			},
		},
	},
});
