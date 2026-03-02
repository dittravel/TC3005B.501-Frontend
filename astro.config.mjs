// @ts-check
import { defineConfig, envField } from 'astro/config';
import node from '@astrojs/node';
import path from 'path';
import { fileURLToPath } from 'url';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://astro.build/config
export default defineConfig({
  base: '/',
  output: "server",
  adapter: node({
    mode: 'standalone'
  }),
  server: {
    open: '/login',
  },
  integrations: [react()],
  vite: {
    plugins: [tailwindcss(), basicSsl()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@assets': path.resolve(__dirname, './src/assets'),
        '@components': path.resolve(__dirname, './src/components'),
        '@layouts': path.resolve(__dirname, './src/layouts'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@type': path.resolve(__dirname, './src/types'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@data': path.resolve(__dirname, './src/data'),
        '@views': path.resolve(__dirname, './src/views'),
        '@config': path.resolve(__dirname, './src/config'),
        '@styles': path.resolve(__dirname, './src/styles'),
      }
    }
  },
  env: {
    schema: {
      PUBLIC_API_BASE_URL: envField.string({
        context: 'server',
        access: 'public',
      }),
      PUBLIC_IS_DEV: envField.boolean({
        default: false,
        context: 'server',
        access: 'public',
      })
    }
  }
});
