// Same React application, prebundled by esbuild then processed by Vite.
// This avoids retaining the entire dependency AST in Rollup on low-commit Windows machines.
import { build } from '../frontend/node_modules/esbuild/lib/main.js';
import { mkdirSync, readFileSync, writeFileSync, cpSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
const root=path.resolve('frontend'),temp=path.join(root,'.build-low-memory');mkdirSync(temp,{recursive:true});
await build({entryPoints:[path.join(root,'src/main.tsx')],bundle:true,format:'iife',platform:'browser',target:'es2022',minify:true,outfile:path.join(temp,'main.js'),jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'},metafile:true}).then(r=>writeFileSync(path.join(temp,'metafile.json'),JSON.stringify(r.metafile)));
const publicDir=path.resolve(temp,'public');
if(!publicDir.startsWith(root+path.sep)||path.basename(path.dirname(publicDir))!=='.build-low-memory')throw Error('Temporary directory outside frontend refused');
rmSync(publicDir,{recursive:true,force:true});cpSync(path.join(root,'public'),publicDir,{recursive:true});mkdirSync(path.join(publicDir,'assets'),{recursive:true});
const names={};for(const ext of ['js','css']){const bytes=readFileSync(path.join(temp,'main.'+ext));names[ext]='index-'+createHash('sha256').update(bytes).digest('hex').slice(0,12)+'.'+ext;writeFileSync(path.join(publicDir,'assets',names[ext]),bytes);}
writeFileSync(path.join(root,'vite.low-memory.config.ts'),`import original from './vite.config';\nexport default { ...original, publicDir: '.build-low-memory/public', plugins: [{ name: 'low-memory-prebundle', transformIndexHtml: { order: 'pre', handler(html: string) { return html.replace('<script type="module" src="/src/main.tsx"></script>', '<link rel="stylesheet" href="/assets/${names.css}"><script defer src="/assets/${names.js}"></script>'); } } }] };\n`);
execFileSync(process.execPath,['--max-old-space-size=512','--max-semi-space-size=1',path.join(root,'node_modules/vite/bin/vite.js'),'build','--config','vite.low-memory.config.ts',...(process.env.VITASOUSS_BUILD_OUT?['--outDir',process.env.VITASOUSS_BUILD_OUT]:[])],{cwd:root,stdio:'inherit',env:{...process.env,NODE_OPTIONS:''}});
