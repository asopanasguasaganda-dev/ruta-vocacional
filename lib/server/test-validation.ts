export function testProblem(t:any):string|undefined{
 if(!t||!Array.isArray(t.questions))return 'El test necesita una lista de preguntas.';
 if(!['manual','dimensions','objective',undefined].includes(t.scoring))return 'Selecciona una regla de evaluación admitida.';
 if(!['mean','sum',undefined].includes(t.aggregation))return 'Selecciona suma o promedio para interpretar los rangos.';
 if(!['immediate','review',undefined].includes(t.resultPublication))return 'Selecciona cuándo publicar los resultados.';
 if(t.estimatedMinutes!==undefined&&(!Number.isInteger(t.estimatedMinutes)||t.estimatedMinutes<0||t.estimatedMinutes>480))return 'La duración estimada debe estar entre 0 y 480 minutos.';
 const validDate=(value:any)=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&!isNaN(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value;
 if((t.availableFrom&&!validDate(t.availableFrom))||(t.due&&!validDate(t.due)))return 'Revisa las fechas de disponibilidad.';
 if(t.availableFrom&&t.due&&t.availableFrom>t.due)return 'El inicio debe ser anterior o igual a la fecha límite.';
 if(t.battery!==undefined&&(typeof t.battery!=='string'||t.battery.length>120))return 'El nombre de la batería no puede superar 120 caracteres.';
 for(const q of t.questions||[]){
  if(![undefined,'open','single','multiple','likert'].includes(q.type))return 'Tipo de pregunta no admitido.';
  if(q.required!==undefined&&typeof q.required!=='boolean')return 'La obligatoriedad debe ser sí o no.';
  if(q.image&&(!/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(q.image)||q.image.length>350000))return 'Usa imágenes PNG, JPEG o WebP de hasta 250 KB.';
  if(q.image&&!q.imageAlt?.trim())return 'Describe la imagen para que la pregunta sea accesible.';
  if(q.explanation!==undefined&&(typeof q.explanation!=='string'||q.explanation.length>3000))return 'La explicación no puede superar 3000 caracteres.';
  if(t.scoring==='objective'){
   if(!['single','multiple'].includes(q.type))return 'Una prueba objetiva admite selección única o múltiple; usa revisión manual para respuestas abiertas.';
   if(!Array.isArray(q.correctValues)||!q.correctValues.length||(q.type==='single'&&q.correctValues.length!==1)||new Set(q.correctValues).size!==q.correctValues.length||q.correctValues.some((v:any)=>!(q.options||t.options||[]).some((o:any)=>o.value===v)))return 'Define la clave correcta de cada pregunta objetiva antes de guardar o publicar.';
   if(q.inverse)return 'La inversión corresponde a escalas, no a claves objetivas.';
  }
 }
 if(t.scoring==='dimensions'&&!t.questions.some((q:any)=>!['open','multiple'].includes(q.type)))return 'El cálculo por dimensión necesita al menos una pregunta de selección única o Likert.';
}
