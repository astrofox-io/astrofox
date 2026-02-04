import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import glsl from 'vite-plugin-glsl';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;

export default defineConfig(({ mode }) => ({
  root: path.resolve(__dirname, 'src/view'),
  publicDir: path.resolve(__dirname, 'src/view/assets'),
  base: './',
  plugins: [
    react({
      include: /src[\\/]view[\\/].*\\.[jt]sx?$/,
    }),
    svgr(),
    glsl(),
  ],
  server: {
    port: Number(PORT),
    strictPort: true,
    fs: {
      allow: [path.resolve(__dirname, 'src')],
    },
  },
  build: {
    outDir: path.resolve(__dirname, 'app'),
    emptyOutDir: false,
  },
  resolve: {
    alias: {
      actions: path.resolve(__dirname, 'src/view/actions'),
      assets: path.resolve(__dirname, 'src/view/assets'),
      audio: path.resolve(__dirname, 'src/audio'),
      canvas: path.resolve(__dirname, 'src/canvas'),
      components: path.resolve(__dirname, 'src/view/components'),
      config: path.resolve(__dirname, 'src/config'),
      core: path.resolve(__dirname, 'src/core'),
      displays: path.resolve(__dirname, 'src/displays'),
      drawing: path.resolve(__dirname, 'src/drawing'),
      effects: path.resolve(__dirname, 'src/effects'),
      global: path.resolve(__dirname, 'src/view/global.jsx'),
      graphics: path.resolve(__dirname, 'src/graphics'),
      hooks: path.resolve(__dirname, 'src/view/hooks'),
      icons: path.resolve(__dirname, 'src/view/icons.jsx'),
      shaders: path.resolve(__dirname, 'src/shaders'),
      styles: path.resolve(__dirname, 'src/view/styles'),
      utils: path.resolve(__dirname, 'src/utils'),
      video: path.resolve(__dirname, 'src/video'),
      view: path.resolve(__dirname, 'src/view'),
      src: path.resolve(__dirname, 'src'),
    },
  },
  css: {
    modules: {
      generateScopedName:
        mode === 'production' ? '[hash:base64]' : '[name]__[local]--[hash:base64:5]',
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode),
  },
}));
