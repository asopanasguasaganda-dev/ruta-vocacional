import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import type {EducationCatalog,EducationData} from '../education-types';
import {fail} from './store';
let cached:EducationCatalog;
function catalog(){return cached ||= JSON.parse(readFileSync(join(process.cwd(),'public/data/education-catalog.json'),'utf8'));}
export function educationProfile(body:Partial<EducationData>){
 const data=catalog(),province=String(body.province||''),canton=String(body.canton||''),parish=String(body.parish||''),schoolId=String(body.schoolId||''),institution=String(body.institution||'').trim();
 if(schoolId){const school=data.schools.find(s=>s.id===schoolId);if(!school)fail('Selecciona un colegio válido del catálogo.');if(province!==school!.province||canton!==school!.canton||parish!==school!.parish)fail('La ubicación no coincide con el colegio seleccionado. Vuelve a seleccionarlo.');return {province,canton,parish,schoolId,institution:school!.name,educationSource:data.metadata.source};}
 const p=data.provinces.find(p=>p.id===province),c=p?.cantons.find(c=>c.id===canton);
 if(province&&!p||canton&&!c||parish&&!c?.parishes.some(p=>p.id===parish))fail('Revisa provincia, cantón y parroquia.');
 if(institution.length>180)fail('El nombre del colegio no puede superar 180 caracteres.');
 return {province,canton,parish,schoolId:'',institution,educationSource:institution?'Declarado por el usuario':''};
}
