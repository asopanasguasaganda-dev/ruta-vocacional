import { jsPDF } from 'jspdf';

export function designTrainingPdf(attempt:any){
  const doc=new jsPDF();
  let y=22;
  const line=(text:string,size=12)=>{
    doc.setFontSize(size);
    for(const part of doc.splitTextToSize(text,170)){
      if(y>275){doc.addPage();y=22;}
      doc.text(part,20,y);y+=7;
    }
    y+=3;
  };
  line('Ruta Vocacional 360°',20);
  line('Resultado de muestra · Diseño interactivo');
  line(attempt.instrument.title,16);
  line(`Puntaje: ${attempt.result.percent ?? 'Pendiente de revisión'}${attempt.result.percent==null?'':' %'}`);
  for(const area of attempt.result.areas||[])line(`${area.area}: ${area.percent ?? 'Pendiente'} %`);
  line('Documento generado en este navegador con datos de muestra.');
  return URL.createObjectURL(doc.output('blob'));
}
