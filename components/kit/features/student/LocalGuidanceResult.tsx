import {useEffect,useState} from 'react';
import {previewAction} from '../../lib/session';
import {GuidanceDocument} from './ResultsDocument';
import {Notice} from '../../components/ui/primitives';
export function LocalGuidanceResult({submissionId}:{submissionId:string}){
 const [report,setReport]=useState<any>(null),[error,setError]=useState('');
 useEffect(()=>{let active=true;previewAction('reports/guidance').then(r=>{if(active)setReport(r.items[0]);}).catch(e=>{if(active)setError(e.message);});return()=>{active=false;};},[submissionId]);
 return error?<Notice tone="warning">{error}</Notice>:report?<GuidanceDocument report={report}/>:<p role="status">Preparando tu guía de carreras…</p>;
}
