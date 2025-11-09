const esbuild = require('esbuild');

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

console.log(
  watch
    ? '[esbuild] Starting in WATCH mode...'
    : production
    ? '[esbuild] Starting in BUILD (production) mode...'
    : '[esbuild] Starting in BUILD (dev) mode...'
);

/**
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
  name: 'esbuild-problem-matcher',
  setup(build) {
    build.onStart(() => {
      console.log('[esbuild] Build started');
    });

    build.onEnd((result) => {
      if (result.errors.length > 0) {
        console.error(`[esbuild] Build failed with ${result.errors.length} error(s)`);
      } else {
        console.log('[esbuild] Build finished successfully');
      }
    });
  },
};

async function main() {
  const ctx = await esbuild.context({
    entryPoints: ['src/extension.ts'],
    bundle: true,
    format: 'cjs',
    minify: production,
    sourcemap: !production,
    sourcesContent: false,
    platform: 'node',
    outfile: 'dist/extension.js',
    external: ['vscode'],
    plugins: [esbuildProblemMatcherPlugin],
  });

  if (watch) {
    await ctx.watch();
    console.log('[esbuild] Watching for file changes...');
  } else {
    await ctx.rebuild();
    await ctx.dispose();
    console.log('[esbuild] Build complete. Exiting.');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
