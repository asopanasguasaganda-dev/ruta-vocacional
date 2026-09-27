import {validateDocxArchive} from './docx-archive';
import {readDocumentMarkup,proposeTests} from './import-content';
export async function importDesignDocument(file:File){
 if(file.size>10*1024*1024)throw Error('El archivo supera el límite de 10 MB.');
 const ext=file.name.split('.').pop()?.toLowerCase();let html='';
 if(ext==='docx'){const buffer=await file.arrayBuffer();validateDocxArchive(new Uint8Array(buffer));const mammoth=await import('mammoth/mammoth.browser');const result=await mammoth.convertToHtml({arrayBuffer:buffer},{convertImage:mammoth.images.imgElement(async()=>({src:'',alt:'Imagen del documento original'}))});html=result.value;}
 else if(ext==='html'||ext==='htm')html=await file.text();
 else if(ext==='pdf')throw Error('La lectura de PDF necesita la instalación con servidor. En esta prueba puedes subir Word (.docx) o HTML.');
 else throw Error('Selecciona un archivo Word (.docx) o HTML.');
 const parsed=readDocumentMarkup(new DOMParser().parseFromString(html,'text/html'));
 if(parsed.text.length>1000000)throw Error('Divide el documento en archivos más pequeños.');
 return {...parsed,tests:proposeTests(parsed.text,parsed.embedded,file.name),id:crypto.randomUUID(),status:'Completado',progress:100};
}
