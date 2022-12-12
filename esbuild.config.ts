import esbuild from 'esbuild';
import { nodeExternalsPlugin } from 'esbuild-node-externals';

esbuild.build({
  bundle: true,
  entryPoints: ['./src/index.ts'],
  minify: true,
  outfile: 'dist/index.js',
  platform: 'node',
  plugins: [nodeExternalsPlugin()],
  sourcemap: true,
  target: 'node16'
})
