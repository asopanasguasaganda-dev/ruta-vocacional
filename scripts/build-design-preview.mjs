import {cp,mkdir,writeFile,rm} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {spawnSync} from 'node:child_process';
const root=process.cwd(),target=resolve(root,'.design-preview');
if(target!==join(root,'.design-preview'))throw Error('Directorio de build inválido');
await rm(target,{recursive:true,force:true});
await mkdir(target,{recursive:true});
for(const file of ['app','components','public','lib','tsconfig.json','next-env.d.ts','postcss.config.mjs','package.json'])await cp(join(root,file),join(target,file),{recursive:true,filter:source=>!source.startsWith(join(root,'app','api'))&&!source.startsWith(join(root,'lib','server'))});
await writeFile(join(target,'next.config.mjs'),`export default {output:'export',trailingSlash:true,images:{unoptimized:true},env:{NEXT_PUBLIC_DESIGN_PREVIEW:'true'},turbopack:{root:${JSON.stringify(root)}}};\n`);
await writeFile(join(target,'app','[...slug]','page.tsx'),`import {KitRoot} from '@/components/kit/Root';
import {routes} from '@/components/kit/routes';
export const dynamicParams=false;
export function generateStaticParams(){return [...new Set([...Object.values(routes),'/restablecer'])].filter(p=>p!=='/').map(p=>({slug:p.slice(1).split('/')}));}
export default function Page(){return <KitRoot/>;}
`);
const result=spawnSync(process.execPath,[join(root,'node_modules','next','dist','bin','next'),'build'],{cwd:target,stdio:'inherit',env:{...process.env,NEXT_PUBLIC_DESIGN_PREVIEW:'true'}});
process.exit(result.status??1);
