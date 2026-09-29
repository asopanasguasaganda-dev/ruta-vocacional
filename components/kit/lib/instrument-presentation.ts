/** Display cleanup only: never change IDs, answer values, order or scoring. */
export function readableText(value:string){
 return value.replace(/\s+/g,' ').replace(/\.{3,}|_{3,}|…{2,}/g,'').trim().replace(/:\s*\.$/,':');
}
export function instrumentPresentation(t:{title:string;description:string;presentation?:{title:string;summary:string}}){
 const title=t.presentation?.title||t.title.replace(/^(?:[IVXLCDM]+\.)?\d+(?:\.\d+)*\.\s*/i,'').trim();
 const description=t.description.trim();
 const summary=t.presentation?.summary||(description.length<=280?description:'Responde cada pregunta siguiendo sus indicaciones. Puedes guardar tu avance y continuar después.');
 return {title,summary,details:description!==summary?description:''};
}
