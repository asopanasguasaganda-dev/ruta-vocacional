import { previewAction, flush } from "../../lib/session";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CloudCheck,
  RotateCcw,
} from "lucide-react";
import type { Instrument, Navigate, Option } from "../../types";
import { answerKey, completion, validAnswer } from "../../data/instruments";
import { isNumberRecord, useLocalState } from "../../lib/storage";
import { Badge, Button, Card, Notice, Progress, TextareaField,Stepper } from "../ui/primitives";
import { Dialog } from "../ui/Dialog";
export function AnswerOptions({
  options,
  value,
  onChange,
  name,
  vertical = false,
}: {
  options: Option[];
  value?: number;
  onChange: (value: number) => void;
  name: string;
  vertical?: boolean;
}) {
  return (
    <div className={vertical ? "answer-list" : "likert-options"}>
      {options.map((option) => (
        <label className="likert-option" key={option.value}>
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
          />
          <span className="radio-dot">{option.value}</span>
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  );
}
export function Questionnaire({
  instrument,
  navigate,
}: {
  instrument: Instrument;
  navigate: Navigate;
}) {
  const [answers, setAnswers, saved] = useLocalState<Record<string, any>>(
    answerKey(instrument),
    {},
    (v):v is Record<string,any>=>!!v&&typeof v==='object'&&!Array.isArray(v),
  );
  const [index, setIndex] = useState(() => {
    const first = instrument.questions.findIndex(
      (q) => !validAnswer(instrument, q.id, answers[q.id]),
    );
    return first < 0 ? 0 : first;
  });
  const [finished, setFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [reset, setReset] = useState(false);
  const [review,setReview]=useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const answered = completion(instrument, answers);
  const total = instrument.questions.length;
  const ready=instrument.questions.every(q=>q.required===false||validAnswer(instrument,q.id,answers[q.id]));
  const q = instrument.questions[index];
  const options = q.options || instrument.options;
  useEffect(() => {
    heading.current?.focus({preventScroll:true});
    const rect=heading.current?.getBoundingClientRect();
    const headerBottom=Math.max(0,document.querySelector('.compact-header')?.getBoundingClientRect().bottom||0);
    if(rect&&(rect.top<headerBottom+16||rect.bottom>window.innerHeight-40))window.scrollBy({top:rect.top-headerBottom-20,behavior:'instant'});
  }, [index, finished]);
  if (finished)
    return (
      <Card className="empty-state">
        <span className="icon-tile teal">
          <CheckCircle2 />
        </span>
        <Badge tone="success">Evaluación completada</Badge>
        <h1 ref={heading} tabIndex={-1}>
          Un paso más en tu ruta
        </h1>
        <p className="muted">
          Has entregado tu evaluación de{" "}
          {instrument.title.toLowerCase()}. Puedes revisar tus respuestas cuando
          quieras.
        </p>
        <div className="row">
          <Button onClick={() => navigate("resultados")}>
            Ver mis resultados
          </Button>
          <Button variant="secondary" onClick={() => navigate("evaluaciones")}>
            Mis evaluaciones
          </Button>
        </div>
      </Card>
    );
  return (
    <>
      <div className="row between">
        <div>
          <p className="eyebrow">CONÓCETE A TU RITMO</p>
          <h2>{instrument.title}</h2>
        </div>
        <Badge tone="primary">
          {index + 1} de {total}
        </Badge>
      </div>
      <p className="muted small" style={{ margin: "12px 0 24px" }}>
        {instrument.description}{!!instrument.estimatedMinutes&&` · Duración estimada: ${instrument.estimatedMinutes} minutos.`}
      </p>
      <Progress
        value={answered}
        total={total}
        label="Avance de la evaluación"
      />
      {instrument.id==='valores'&&<Stepper labels={['Ambiente','Motivación','Valores']} current={index}/>}
      <Card className="question-card">
        <p className="eyebrow center">Pregunta {index + 1}{q.required===false?' · Opcional':''}</p>
        <h1 ref={heading} tabIndex={-1} className="center">
          {q.text}
        </h1>
        {q.image&&<img className="assessment-image" src={q.image} alt={q.imageAlt||''}/>}<fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend className="sr-only">{q.text}</legend>
          {q.type==='open'?<TextareaField label="Tu respuesta" rows={5} value={answers[q.id]||''} onChange={e=>void setAnswers(prev=>({...prev,[q.id]:e.target.value}))}/>:q.type==='multiple'?<div className="answer-list">{options.map(o=><label className="likert-option" key={o.value}><input type="checkbox" checked={(answers[q.id]||[]).includes(o.value)} onChange={e=>void setAnswers(prev=>({...prev,[q.id]:e.target.checked?[...(prev[q.id]||[]),o.value]:(prev[q.id]||[]).filter((v:number)=>v!==o.value)}))}/>{o.label}</label>)}</div>:<AnswerOptions key={q.id}
            options={options}
            value={answers[q.id]}
            onChange={(value) =>
              setAnswers((prev) => ({ ...prev, [q.id]: value }))
            }
            name={q.id}
            vertical={!!q.options}
          />}
        </fieldset>
        {q.required===false&&<Button variant="ghost" size="sm" onClick={()=>setAnswers(prev=>{const next={...prev};delete next[q.id];return next;})}>Dejar esta pregunta sin respuesta</Button>}<div className="question-footer">
          <Button
            variant="secondary"
            disabled={index === 0}
            onClick={() => setIndex(Math.max(0,index - 1))}
            icon={<ArrowLeft size={17} />}
          >
            Anterior
          </Button>
          <span className="question-status">
            <CloudCheck size={16} />
            {saved
              ? "Avance guardado en tu cuenta"
              : "Guardando respuestas…"}
          </span>
          <Button
            disabled={q.required!==false&&!validAnswer(instrument, q.id, answers[q.id])}
            loading={submitting}
            onClick={async () => {
              if (index < total - 1) setIndex(Math.min(total-1,index + 1));
              else if (ready) {
                setReview(true);
              }
              else
                setIndex(
                  instrument.questions.findIndex(
                    (item) =>
                      item.required!==false&&!validAnswer(instrument, item.id, answers[item.id]),
                  ),
                );
            }}
            icon={<ArrowRight size={17} />}
          >
            {index === total - 1
              ? ready
                ? "Revisar y finalizar"
                : "Revisar pendientes"
              : "Siguiente"}
          </Button>
        </div>
      </Card>
      {submitError && <Notice tone="danger">{submitError}</Notice>}
      <Dialog open={review} onClose={()=>setReview(false)} title="Revisa tus respuestas" wide><div className="stack">{instrument.questions.map((item,i)=><div className="row between" key={item.id}><div><b>{i+1}. {item.text}</b><p className="muted">{item.type==='open'?answers[item.id]:(item.options||instrument.options).filter(o=>Array.isArray(answers[item.id])?answers[item.id].includes(o.value):o.value===answers[item.id]).map(o=>o.label).join(', ')}</p></div><Button size="sm" variant="ghost" onClick={()=>{setIndex(i);setReview(false);}}>Editar</Button></div>)}{submitError&&<Notice tone="danger">{submitError}</Notice>}<Button loading={submitting} onClick={async()=>{setSubmitting(true);setSubmitError('');try{await flush();await previewAction('assessments/submit',{method:'POST',body:JSON.stringify({instrumentId:instrument.id})});setReview(false);setFinished(true);}catch(e){setSubmitError((e as Error).message);}finally{setSubmitting(false);}}}>Confirmar entrega</Button></div></Dialog>
      <div className="row between">
        <div className="question-jump" aria-label="Ir a una pregunta">
          {instrument.questions.map((item, i) => (
            <button
              key={item.id}
              onClick={() => setIndex(i)}
              className={
                (validAnswer(instrument, item.id, answers[item.id])
                  ? "answered "
                  : "") + (index === i ? "active" : "")
              }
              aria-label={
                "Pregunta " +
                (i + 1) +
                (validAnswer(instrument, item.id, answers[item.id])
                  ? ", respondida"
                  : ", pendiente")
              }
              aria-current={index === i ? "step" : undefined}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setReset(true)}
          icon={<RotateCcw size={14} />}
        >
          Reiniciar
        </Button>
      </div>
      <p className="muted small" style={{ marginTop: 24 }}>
        {instrument.scoring==='objective'?'Prueba de conocimientos con la clave configurada por tu institución.':instrument.scoring==='manual'?'Las respuestas se conservan para reflexión o revisión por el equipo autorizado.':'Cuestionario orientativo. Contrasta tus resultados con experiencias e información sobre las opciones que te interesan.'}
      </p>
      <Dialog
        open={reset}
        onClose={() => setReset(false)}
        title="¿Reiniciar esta evaluación?"
      >
        <div className="stack">
          <p className="muted">
            Se borrarán únicamente las respuestas de{" "}
            {instrument.title.toLowerCase()} en tu borrador. Las entregas del historial se conservan.
          </p>
          <div className="row">
            <Button
              variant="danger"
              onClick={() => {
                setAnswers({});
                setIndex(0);
                setReset(false);
              }}
            >
              Reiniciar respuestas
            </Button>
            <Button variant="secondary" onClick={() => setReset(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
