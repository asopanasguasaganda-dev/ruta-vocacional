import {build} from 'esbuild';
await build({entryPoints:['lib/server/import-presentation-handler.ts'],outfile:'api/import-presentation.js',bundle:true,platform:'node',target:'node24',format:'cjs',packages:'external',minify:true,legalComments:'none',footer:{js:'module.exports = module.exports.default;'}});
// Vercel's standalone function must not inherit Next's preserve-ESM TS settings.
// Bundle the shared validators and JSON into one executable CommonJS handler.
await build({entryPoints:['lib/server/design-publications-handler.ts'],outfile:'api/design-publications.js',bundle:true,platform:'node',target:'node24',format:'cjs',packages:'external',minify:true,legalComments:'none',footer:{js:'module.exports = module.exports.default;'}});
await build({entryPoints:['lib/server/publisher-session-handler.ts'],outfile:'api/publisher-session.js',bundle:true,platform:'node',target:'node24',format:'cjs',packages:'external',minify:true,legalComments:'none',footer:{js:'module.exports = module.exports.default;'}});
