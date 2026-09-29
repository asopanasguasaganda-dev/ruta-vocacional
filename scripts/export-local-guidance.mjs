import {writeFileSync} from 'node:fs';
import {publicCatalog,readAcademic,areas,areaFor,degreeOffer} from '../lib/server/academic-content.mjs';
const source=publicCatalog(),content=readAcademic();
const mappedArea=name=>/AUDITOR|CONTAB/.test(name.normalize('NFD').replace(/[\u0300-\u036f]/g,''))?areas.find(a=>a.id==='negocios'):areaFor(name);
const careers=source.careers.map(c=>({...c,area:mappedArea(c.name)?.name||c.area,interests:mappedArea(c.name)?.dimensions||[],areaId:mappedArea(c.name)?.id||'',sourceUrl:source.sourceUrl,sourceDate:source.retrievedAt,offers:c.offers.map(o=>({...o,level:degreeOffer(o)?'Grado universitario':'Técnico o tecnológico'}))}));
writeFileSync('components/kit/data/design-careers.json',JSON.stringify({careers,source:{source:source.source,sourceUrl:source.sourceUrl,date:source.retrievedAt,careerCount:careers.length,offerCount:source.offerCount,scope:'Oferta nacional de tercer nivel consultada en el CES'},institutions:[...new Set(careers.flatMap(c=>c.offers.map(o=>o.institution)))].sort()}));
writeFileSync('components/kit/data/academic-guidance.json',JSON.stringify({id:content.id,version:content.version,source:content.source,model:content.model,createdAt:content.createdAt,categories:content.categories,areas},null,2));
console.log('Exported public catalog and academic content only; no credentials or student data.');
