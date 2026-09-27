// Run with: node --env-file=.env.local scripts/refresh-academic-content.mjs
import {refreshAcademicContent} from '../lib/server/academic-content.mjs';
try{const r=await refreshAcademicContent();console.log(JSON.stringify({source:r.source,model:r.model,version:r.version,contentId:r.id,categories:r.categories.length,reused:!!r.reused}));}catch(e){console.error('Contenido académico no actualizado:',e.message);process.exitCode=1;}
