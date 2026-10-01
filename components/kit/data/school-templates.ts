import {interests} from './instruments';
import {importedInstrument} from '../lib/import-rules';
import type {Simulator} from '../lib/training-types';

export function schoolOrientationTemplate(){
 const t=structuredClone(interests);
 const result=t.schemaVersion===2?t:importedInstrument({data:{...t,scoring:'dimensions',aggregation:'sum'},items:t.questions},t,'Cuestionario interno de exploración de intereses de Ruta Vocacional');
 return {...result,educationLevel:'bachillerato' as const,title:'Exploro mis intereses para elegir bachillerato',description:'Para estudiantes de EGB Superior que pasarán a BGU. Indica cuánto te gustaría realizar cada actividad. Tus intereses ayudan a comparar Ciencias y Técnico; no hay respuestas correctas ni un certificado de aptitud.'};
}

export function schoolPracticeTemplate(blank:Simulator,kind:'ciencias'|'tecnico'):Simulator{
 const science=kind==='ciencias';
 const items= science ? [
  ['Una planta recibe agua y luz. Para estudiar el efecto de la luz, ¿qué comparación es más adecuada?',['Dos plantas iguales con distinta luz y la misma cantidad de agua','Dos plantas distintas con distinta agua y luz','Una sola planta sin registrar cambios'],1,'Cambia una variable y mantén las otras condiciones comparables.'],
  ['Una tabla registra 12, 14 y 16 estudiantes. ¿Cuál es el promedio?',['12','14','16'],2,'Suma los tres valores y divide para tres.'],
  ['¿Qué ayuda a contrastar una explicación científica?',['Buscar evidencias y considerar otras explicaciones','Aceptar la primera opinión','Evitar registrar resultados'],1,'Las explicaciones se contrastan con evidencias.'],
 ] : [
  ['Antes de usar una herramienta desconocida en un taller, ¿qué debes hacer?',['Pedir instrucciones y revisar las medidas de seguridad','Usarla sin supervisión','Desactivar sus protecciones'],1,'Revisa las instrucciones y trabaja bajo la supervisión indicada.'],
  ['Una pieza mide 2 metros. ¿Cuántos centímetros mide?',['20','200','2000'],2,'Un metro equivale a 100 centímetros.'],
  ['Un prototipo no funciona como se esperaba. ¿Cuál es un buen siguiente paso?',['Registrar el fallo, revisar el diseño y probar una mejora','Cambiar todo sin observar el problema','Ocultar el resultado'],1,'La mejora de un proyecto requiere observar, registrar y probar.'],
 ];
 const title=science?'Exploro Ciencias: evidencias y razonamiento':'Exploro Técnico: proyectos y resolución de problemas';
 return {...blank,educationLevel:'bachillerato',title,careerIds:['bachillerato:'+kind],instrument:{...blank.instrument,title,educationLevel:'bachillerato',description:'Actividad introductoria para EGB Superior. La nota indica cómo resolviste estos ejercicios; compara también tus intereses y experiencias para elegir bachillerato.',source:'Preguntas originales de Ruta Vocacional. Plantilla interna de práctica; no es una prueba oficial del Ministerio de Educación.'},questions:items.map(([text,labels,correct,explanation],i)=>({id:'explora-'+kind+'-'+i,text:String(text),reviewed:true,source:'Actividad original de Ruta Vocacional para explorar contenidos de EGB Superior y BGU.',type:'single',policy:'objective',weight:1,required:false,options:(labels as string[]).map((label,j)=>({value:j+1,label})),correctValues:[Number(correct)],explanation:String(explanation)}))};
}
