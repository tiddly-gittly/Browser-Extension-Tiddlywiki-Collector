import { crx } from '@crxjs/vite-plugin';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import manifest from './src/manifest';

export default defineConfig({
  // @see https://github.com/crxjs/chrome-extension-tools/issues/696
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      port: 5173,
    },
    // cors: {
		// 	origin: [
		// 		// ⚠️ SECURITY RISK: Allows any chrome-extension to access the vite server ⚠️
		// 		// See https://github.com/crxjs/chrome-extension-tools/issues/971 for more info
		// 		// I don't believe that the linked issue mentions a potential solution
		// 		/chrome-extension:\/\//,
		// 	],
		// },
  },
  legacy: {
    // Fix https://github.com/crxjs/chrome-extension-tools/issues/971#issuecomment-2679065834
    skipWebSocketTokenCheck: true,
  },
  // prevent src/ prefix on extension urls
  root: path.resolve(__dirname, 'src'),
  publicDir: path.resolve(__dirname, 'public'),
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    rollupOptions: {
      input: {
        // see web_accessible_resources in the manifest config
        welcome: path.join(__dirname, 'src/welcome/welcome.html'),
      },
      output: {
        chunkFileNames: 'assets/chunk-[hash].js',
      },
    },
  },
  plugins: [react(), crx({ manifest })],
});
