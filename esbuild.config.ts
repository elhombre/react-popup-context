import esbuild, { BuildOptions } from 'esbuild'
import { nodeExternalsPlugin } from 'esbuild-node-externals'

const options: BuildOptions = {
  bundle: true,
  entryPoints: ['./src/index.ts'],
  minify: true,
  outfile: 'dist/index.js',
  platform: 'node',
  plugins: [nodeExternalsPlugin()],
  sourcemap: true,
  target: 'node16'
}

esbuild.build({
  ...options,
  outfile: 'dist/index.js',
})

esbuild.build({
  ...options,
  format: 'esm',
  outfile: 'dist/index.esm.js'
})
