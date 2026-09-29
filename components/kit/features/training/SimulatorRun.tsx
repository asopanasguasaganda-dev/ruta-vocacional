"use client";
import {Dialog} from "../../components/ui/Dialog";
import {absent} from "../../lib/test-engine";
import { answerText } from "../../lib/test-answer-text";
import { useEffect, useState, useRef } from "react";
import { trainingApi, decimal } from "./shared";
import { Button, Card, Notice } from "../../components/ui/primitives";
import { TestQuestion } from "../../components/domain/TestQuestion";
export function SimulatorRun({
  initial,
  onClose,
}: {
  initial: any;
  onClose: () => void;
}) {
  const [a, setA] = useState(initial),
    [answers, setAnswers] = useState(initial.answers),
    [flags, setFlags] = useState<string[]>(initial.flags),
    [index, setIndex] = useState(0),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [dirty, setDirty] = useState(false),
    [confirmFinish,setConfirmFinish]=useState(false),
    [feedback, setFeedback] = useState(""),
    [clock, setClock] = useState(Date.now()),
    [offset] = useState(Date.parse(initial.serverTime) - Date.now());
  const latest=useRef({answers,flags});latest.current={answers,flags};
  const revision=useRef(initial.revision),saving=useRef<Promise<any>|null>(null);
  useEffect(()=>{if(!dirty||a.state!=='in_progress')return;const timer=setTimeout(()=>void act(async()=>{await save();}),600);return()=>clearTimeout(timer);},[answers,flags,dirty,a.state]);
  const q = a.instrument.questions[index];
  const answered=a.instrument.questions.filter((q:any)=>!absent(answers[q.id])).length;
  const remaining = a.expires_at
    ? Math.max(0, Math.ceil((Date.parse(a.expires_at) - clock - offset) / 1000))
    : null;
  useEffect(() => {
    const timer = setInterval(() => setClock(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  useEffect(() => {
    if (remaining !== 0 || a.state !== "in_progress") return;
    trainingApi("/attempt?id=" + a.id)
      .then((r) => {
        revision.current=r.revision;setA(r);
        setAnswers(r.answers);
        setDirty(false);
      })
      .catch((e) => setError(e.message));
  }, [remaining, a.id, a.state]);
  async function act(fn: () => Promise<void>) {
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function save() {
    if(saving.current)await saving.current;
    const payload=latest.current;
    const request=trainingApi('/answers',{id:a.id,revision:revision.current,...payload},'PUT');saving.current=request;
    try{const r=await request;revision.current=r.revision;setA(r);setDirty(JSON.stringify(payload)!==JSON.stringify(latest.current));return r;}finally{if(saving.current===request)saving.current=null;}
  }
  if (a.result)
    return (
      <div className="training-runner">
        <TrainingResult attempt={a} />
        <Button onClick={onClose}>Volver al curso</Button>
      </div>
    );
  return (
    <div className="training-runner">
      <div className="training-toolbar">
        <div>
          <small>
            {a.mode === "exam" ? "Simulación de examen" : "Práctica"} · Versión{" "}
            {a.instrument.version}
          </small>
          <h2>{a.instrument.title}</h2>
        </div>
        <span role="timer">
          {remaining === null
            ? "Sin límite de tiempo"
            : Math.floor(remaining / 60) +
              ":" +
              String(remaining % 60).padStart(2, "0")}
        </span>
      </div>
      <Notice>
        Preparación propia. Las omisiones cuentan como cero y permanecen en el
        máximo.{" "}
        {a.mode === "practice" && a.feedback === "question"
          ? "La nota utiliza tu primera respuesta confirmada."
          : ""}
      </Notice>
      {error && (
        <Notice tone="danger">
          {error}
          <Button
            variant="ghost"
            onClick={() =>
              act(async () => {
                const r = await trainingApi("/attempt?id=" + a.id);
                revision.current=r.revision;setA(r);
                setAnswers(r.answers);
                setFlags(r.flags);
                setDirty(false);
              })
            }
          >
            Recuperar lo guardado
          </Button>
        </Notice>
      )}
      <div className="exam-workspace"><aside className="exam-sidebar"><h3>Navegación del examen</h3><p>{answered} de {a.instrument.questions.length} respondidas</p><progress max={a.instrument.questions.length} value={answered} aria-label="Progreso de respuestas"/><nav
        className="training-question-nav"
        aria-label="Preguntas del simulador"
      >
        {a.instrument.questions.map((x: any, i: number) => (
          <button
            className={!absent(answers[x.id])?"is-answered":""}
            aria-label={"Pregunta "+(i+1)+(!absent(answers[x.id])?", respondida":", sin responder")+(flags.includes(x.id)?", marcada":"")}
            aria-current={i === index ? "step" : undefined}
            key={x.id}
            onClick={() => {
              setIndex(i);
              setFeedback("");
            }}
          >
            {i + 1}{!absent(answers[x.id])?" ✓":""}
            {flags.includes(x.id) ? " ★" : ""}
          </button>
        ))}
      </nav><p className="small">✓ Respondida · ★ Marcada para volver</p><p className="small">Puedes cambiar tus respuestas antes de entregar.</p></aside>
      <Card className="exam-question">
        <p className="eyebrow">
          Pregunta {index + 1} de {a.instrument.questions.length}
        </p>
        <h3>{q.text}</h3>
        <TestQuestion
          instrument={a.instrument}
          question={q}
          value={answers[q.id]}
          onChange={(v) => {
            setAnswers({ ...answers, [q.id]: v });
            setDirty(true);
            setFeedback("");
          }}
        />
        <label>
          <input
            type="checkbox"
            checked={flags.includes(q.id)}
            onChange={(e) => {
              setFlags(
                e.target.checked
                  ? [...flags, q.id]
                  : flags.filter((f) => f !== q.id),
              );
              setDirty(true);
            }}
          />{" "}
          Marcar para revisar
        </label>
        {a.mode === "practice" && a.feedback === "question" && (
          <Button
            disabled={busy}
            variant="secondary"
            onClick={() =>
              act(async () => {
                await save();
                const r = await trainingApi("/feedback", {
                  id: a.id,
                  questionId: q.id,
                });
                setFeedback(r.explanation + " " + r.note);
              })
            }
          >
            Confirmar y ver explicación
          </Button>
        )}
        {feedback && <Notice>{feedback}</Notice>}
        <div className="exam-page-actions"><Button variant="secondary" disabled={index===0||busy} onClick={()=>{setIndex(index-1);setFeedback('');}}>Anterior</Button><Button disabled={index===a.instrument.questions.length-1||busy} onClick={()=>{setIndex(index+1);setFeedback('');}}>Siguiente</Button></div>
      </Card></div>
      <p aria-live="polite">
        {dirty
          ? "Hay cambios sin sincronizar. Guarda antes de salir."
          : process.env.NEXT_PUBLIC_DESIGN_PREVIEW === "true" ? "Respuestas guardadas en este navegador." : "Respuestas confirmadas por el servidor."}
      </p>
      <div className="training-actions">
        <Button
          disabled={busy}
          onClick={() =>
            act(async () => {
              await save();
            })
          }
        >
          Guardar respuestas
        </Button>
        <Button
          disabled={busy}
          variant="secondary"
          onClick={()=>setConfirmFinish(true)}
        >
          Entregar simulador
        </Button>
        <Button
          disabled={busy}
          variant="ghost"
          onClick={() =>
            act(async () => {
              if (dirty) await save();
              onClose();
            })
          }
        >
          Guardar y volver
        </Button>
      </div>
      <Dialog open={confirmFinish} title="Revisa antes de entregar" onClose={()=>{if(!busy)setConfirmFinish(false);}}><div className="stack"><p>{answered} de {a.instrument.questions.length} preguntas respondidas.</p><p>{a.instrument.questions.length-answered} sin responder · {flags.length} marcadas para revisar.</p><Notice>Al confirmar recibirás tu nota automáticamente. Las preguntas sin responder cuentan como cero.</Notice>{error&&<Notice tone="danger">{error}</Notice>}<Button disabled={busy} onClick={()=>act(async()=>{if(dirty)await save();setA(await trainingApi('/finish',{id:a.id}));setConfirmFinish(false);})}>Confirmar entrega y ver nota</Button><Button variant="secondary" disabled={busy} onClick={()=>setConfirmFinish(false)}>Volver a las preguntas</Button></div></Dialog>
    </div>
  );
}
export function TrainingResult({ attempt: a }: { attempt: any }) {
  const r = a.result,
    [pdf, setPdf] = useState(false);
  const [pdfUrl,setPdfUrl]=useState('');
  useEffect(()=>{
    if(process.env.NEXT_PUBLIC_DESIGN_PREVIEW!=='true')return;
    let cancelled=false,url='';
    import('../../lib/design-training-pdf').then(({designTrainingPdf})=>{
      if(cancelled)return;
      url=designTrainingPdf(a);setPdfUrl(url);
    });
    return ()=>{cancelled=true;if(url)URL.revokeObjectURL(url);};
  },[a]);
  const pdfSource=process.env.NEXT_PUBLIC_DESIGN_PREVIEW==='true'?pdfUrl:'/api/training/pdf?id='+a.id;
  return (
    <Card className="training-result">
      <small>
        {a.mode === "exam" ? "Simulación de examen" : "Práctica"} · Versión{" "}
        {a.instrument.version} · Revisión {r.revision}
      </small>
      <h2>{a.instrument.title}</h2>
      <div className="training-summary">
        <div>
          <strong>
            {r.state==='annulled'?'Anulado':decimal(r.percent)}
            {r.percent != null ? " / 100" : ""}
          </strong>
          <p>Nota calculada automáticamente</p>
        </div>
        <div>
          <strong>
            {decimal(r.raw)} / {decimal(r.max)}
          </strong>
          <p>
            Puntos{" "}
            {r.state === "pending-review" ? "provisionales" : "obtenidos"}
          </p>
        </div>
        <div>
          <strong>{r.coverage.omitted}</strong>
          <p>Preguntas omitidas</p>
        </div>
      </div>
      <Notice>
        {r.note}{" "}
        {r.annulled?.length
          ? `${r.annulled.length} preguntas anuladas. ${r.annulmentPolicy}`
          : ""}{" "}
        {r.state === "pending-review"
          ? "Hay respuestas pendientes de revisión."
          : ""}
      </Notice>
      {r.areas.map((x: any) => (
        <div key={x.area}>
          <b>{x.area}</b>
          <p>
            {decimal(x.raw)} de {decimal(x.max)} · {decimal(x.percent)} %
            {x.weight ? " · Peso " + x.weight + " %" : ""}
          </p>
          <progress max={100} value={x.percent} />
        </div>
      ))}
      <details>
        <summary>Historial de revisiones</summary>
        {a.resultHistory?.map((h: any) => (
          <p key={h.revision}>
            Revisión {h.revision} ·{" "}
            {new Date(h.created_at).toLocaleString("es-EC", {
              timeZone: "America/Guayaquil",
            })}{" "}
            · {h.reason}
          </p>
        ))}
      </details>
      <details>
        <summary>Respuestas y explicaciones</summary>
        {a.instrument.questions.map((q: any) => (
          <section key={q.id}>
            <h3>{q.text}</h3>
            {r.annulled?.includes(q.id)&&<p>Pregunta anulada; excluida del cálculo.</p>}
            <p>{answerText(a.instrument, q, r.answers[q.id])}</p>
            <p>{a.explanations?.find((e: any) => e.id === q.id)?.text}</p>
          </section>
        ))}
      </details>
      <div className="training-actions">
        <Button variant="secondary" onClick={() => setPdf(!pdf)}>
          {pdf ? "Cerrar PDF" : "Vista previa del PDF"}
        </Button>
        <a
          className="button button--secondary"
          href={pdfSource||undefined}
          target="_blank"
          rel="noreferrer"
        >
          Abrir o imprimir PDF
        </a>
      </div>
      {pdf && (
        <iframe
          title={"Resultado de " + a.instrument.title}
          src={pdfSource||undefined}
        />
      )}
    </Card>
  );
}
