import type {Instrument} from '../../types';
import {instrumentPresentation} from '../../lib/instrument-presentation';
export function InstrumentIntroduction({instrument,heading=false}:{instrument:Instrument;heading?:boolean}){
 const view=instrumentPresentation(instrument);
 return <div className="instrument-introduction stack-sm">{heading&&<h1>{view.title}</h1>}<p className="muted">{view.summary}</p>{view.details&&<details className="question-instructions"><summary>Leer instrucciones completas y contexto</summary><p style={{whiteSpace:'pre-line'}}>{view.details}</p></details>}</div>;
}
