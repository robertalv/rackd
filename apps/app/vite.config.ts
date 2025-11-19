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
	optimizeDeps: {
		esbuildOptions: {
			mainFields: ["module", "main"],
		},
	},
	build: {
		commonjsOptions: {
			transformMixedEsModules: true,
		},
		sourcemap: true,
	},
});
