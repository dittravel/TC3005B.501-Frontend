// @ts-check
import { defineConfig, envField } from 'astro/config';
import node from '@astrojs/node';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

// https://astro.build/config
export default defineConfig({
  base: '/',
  output: "server",
  adapter: node({
    mode: 'standalone'
  }),
  server: {
    open: '/login',
    host: '0.0.0.0',
    port: 4321,
  },
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
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
