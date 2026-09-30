import {createTrainingReport} from './training-report-pdf';
export function designTrainingPdf(attempt:any){return URL.createObjectURL(createTrainingReport(attempt).output('blob'));}
