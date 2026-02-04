import path from 'path';
import { fileURLToPath } from 'url';
import { builtinModules } from 'module';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const external = [
  'electron',
  ...builtinModules,
  ...builtinModules.map(module => `node:${module}`),
];

export default defineConfig(({ mode }) => ({
  build: {
    target: 'node18',
    outDir: path.resolve(__dirname, 'app'),
    emptyOutDir: false,
    lib: {
      entry: path.resolve(__dirname, 'src/main/index.js'),
      formats: ['cjs'],
      fileName: () => 'main.js',
    },
    rollupOptions: {
      external,
    },
  },
  resolve: {
    alias: {
      config: path.resolve(__dirname, 'src/config'),
      main: path.resolve(__dirname, 'src/main'),
      utils: path.resolve(__dirname, 'src/utils'),
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode),
  },
}));
