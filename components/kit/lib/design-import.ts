import {prepareImportedPresentation} from './import-presentation';
import {validateDocxArchive} from './docx-archive';
import {readDocumentMarkup,proposeTests} from './import-content';
export async function importDesignDocument(file:File){
 if(file.size>10*1024*1024)throw Error('El archivo supera el límite de 10 MB.');
 const ext=file.name.split('.').pop()?.toLowerCase();let html='';
 if(ext==='docx'){const buffer=await file.arrayBuffer();validateDocxArchive(new Uint8Array(buffer));const mammoth=await import('mammoth/mammoth.browser');const result=await mammoth.convertToHtml({arrayBuffer:buffer},{convertImage:mammoth.images.imgElement(async()=>({src:'',alt:'Imagen del documento original'}))});html=result.value;}
 else if(ext==='html'||ext==='htm')html=await file.text();
 else if(ext==='pdf'){
  const pdfjs=await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc='/vendor/pdf.worker.min.mjs';
  const task=pdfjs.getDocument({data:new Uint8Array(await file.arrayBuffer())});
  const pdf=await task.promise;
  try{
   if(pdf.numPages>100)throw Error('Divide el PDF en documentos de hasta 100 páginas.');
   const pages:string[]=[];
   for(let n=1;n<=pdf.numPages;n++){
    const page=await pdf.getPage(n),content=await page.getTextContent();let text='',lastY:number|undefined;
    for(const item of content.items){if(!('str' in item))continue;const y=item.transform[5];if(lastY!==undefined&&Math.abs(y-lastY)>3&&!text.endsWith('\n'))text+='\n';text+=item.str+(item.hasEOL?'\n':' ');lastY=y;}
    pages.push(text);page.cleanup();
   }
   const text=pages.join('\n');
   if(text.trim().length<30)throw Error('Este PDF no contiene texto seleccionable. Aplica reconocimiento de texto (OCR) o importa el Word o HTML original.');
   return prepareImportedPresentation({text,tests:proposeTests(text,[],file.name),warnings:['PDF extraído como texto. Revisa el orden de las preguntas, las opciones y la clave antes de publicar.'],id:crypto.randomUUID(),status:'Completado',progress:100});
  }finally{await task.destroy();}
 }
 else throw Error('Selecciona un archivo PDF con texto, Word (.docx) o HTML.');
 const parsed=readDocumentMarkup(new DOMParser().parseFromString(html,'text/html'));
 if(parsed.text.length>1000000)throw Error('Divide el documento en archivos más pequeños.');
 return prepareImportedPresentation({...parsed,tests:proposeTests(parsed.text,parsed.embedded,file.name),id:crypto.randomUUID(),status:'Completado',progress:100});
}
