import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parseEnv } from 'node:util';
import nextEnv from '@next/env';

nextEnv.loadEnvConfig(process.cwd());
const privateEnv = existsSync('.local/hostinger-admin.env') ? parseEnv(readFileSync('.local/hostinger-admin.env','utf8')) : {};
const secrets = [...Object.entries(process.env), ...Object.entries(privateEnv)]
  .filter(([key,value])=>/(?:PASSWORD|SECRET|TOKEN|API_KEY|DATABASE_URL|PRIVATE_KEY|ADMIN_EMAIL)$/.test(key) && value?.length >= 8)
  .map(([key,value])=>({key,value}));
const bundle=resolve(process.env.NEXT_DIST_DIR || '.next','static');
if(!existsSync(bundle))throw Error('Compila antes de comprobar los archivos públicos.');
const findings=[];
function visit(folder){
  for(const entry of readdirSync(folder,{withFileTypes:true})){
    const file=join(folder,entry.name);
    if(entry.isSymbolicLink())continue;
    if(entry.isDirectory()){visit(file);continue;}
    const bytes=readFileSync(file);
    for(const {key,value} of secrets) if(bytes.includes(Buffer.from(value)))findings.push({file,key});
    if(/(?:\.env(?:\.|$)|\.(?:sqlite|pem|key)$)/i.test(entry.name))findings.push({file,key:'private-file'});
  }
}
visit('public');visit(bundle);
if(findings.length){
  for(const {file,key} of findings) console.error('Secret exposure:',file,'variable:',key);
  process.exitCode=1;
}else console.log('PASS: configured server secrets absent from public assets and browser bundles. No secret values printed.');
