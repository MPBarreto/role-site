import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const projectRoot = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  build: {
    rolldownOptions: {
      input: {
        home: resolve(projectRoot, 'index.html'),
        terms: resolve(projectRoot, 'terms.html'),
        privacy: resolve(projectRoot, 'privacy.html'),
        refunds: resolve(projectRoot, 'reembolsos.html'),
        producers: resolve(projectRoot, 'produtores.html')
      }
    }
  }
});
