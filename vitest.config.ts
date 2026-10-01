import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import glslLoader from './loaders/glsl-loader';

// Unit tests cover the pure timeline modules, frame-time behaviour of effects
// and reactors, the Document, Project, Media, offline frames and export
// (through their interfaces with fake adapters), and the main process's ffmpeg
// jobs (with a fake ffmpeg); the rest of the renderer and Electron code is
// verified through the running app.
export default defineConfig({
  plugins: [
    {
      // Shaders import as strings, the same way the Next build loads them.
      name: 'glsl',
      enforce: 'pre',
      transform(code, id) {
        if (id.endsWith('.glsl')) {
          return glslLoader.call({ resourcePath: id }, code);
        }
      },
    },
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    include: ['src/**/*.test.ts', 'electron/**/*.test.ts'],
    environment: 'node',
  },
});
