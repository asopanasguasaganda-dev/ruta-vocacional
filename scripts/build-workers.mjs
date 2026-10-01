import { build } from 'esbuild';
await build({entryPoints:['scripts/import-worker.mjs'],outfile:'.runtime/import-worker.cjs',bundle:true,platform:'node',target:'node24',format:'cjs',packages:'external',logLevel:'warning'});
