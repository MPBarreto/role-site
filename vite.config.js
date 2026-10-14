import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const projectRoot = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  build: {
    rolldownOptions: {
      input: {
        home: resolve(projectRoot, 'index.html'),
        terms: resolve(projectRoot, 'termos.html'),
        privacy: resolve(projectRoot, 'privacidade.html'),
        refunds: resolve(projectRoot, 'reembolsos.html')
      }
    }
  }
});
