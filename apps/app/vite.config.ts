import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import netlify from '@netlify/vite-plugin-tanstack-start'
import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";

export default defineConfig({
	plugins: [tsconfigPaths(), tanstackStart(), tailwindcss(), viteReact(), netlify()],
	ssr: {
		noExternal: ["@hugeicons/react", "@hugeicons/core-free-icons"],
		external: ["jspdf", "html-to-image"],
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
