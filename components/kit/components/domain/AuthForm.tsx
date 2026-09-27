import { useEffect, useId, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button, Checkbox, Field, Notice, SelectField, Stepper } from '../ui/primitives';
export type AuthMode = 'login' | 'register' | 'reset' | 'admin';
export interface AuthPayload { email: string; password?: string; name?: string; stage?: string; institution?: string }

export function PasswordField({label,value,onChange,error,autoComplete='current-password'}:{label:string;value:string;onChange:(v:string)=>void;error?:string;autoComplete?:string}) {
  const [visible,setVisible]=useState(false);
  const id=useId();
  return <div className="password-field">
    <Field id={id} label={label} type={visible?'text':'password'} value={value} onChange={e=>onChange(e.target.value)} error={error} autoComplete={autoComplete} autoCapitalize="none" spellCheck={false} required />
    <button type="button" className="password-toggle" aria-controls={id} aria-pressed={visible} aria-label={visible?'Ocultar contraseña':'Mostrar contraseña'} onClick={()=>setVisible(v=>!v)}>{visible?<EyeOff size={18}/>:<Eye size={18}/>}</button>
  </div>;
}

export function AuthForm({mode,onSubmit,onNavigate}:{mode:AuthMode;onSubmit:(payload:AuthPayload)=>Promise<void>;onNavigate:(mode:AuthMode)=>void}) {
  const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[name,setName]=useState(''),[surname,setSurname]=useState('');
  const [stage,setStage]=useState(''),[consent,setConsent]=useState(false);
  const [step,setStep]=useState(0),[busy,setBusy]=useState(false),[done,setDone]=useState(false),[error,setError]=useState('');
  const [errors,setErrors]=useState<Record<string,string>>({});
  const formRef=useRef<HTMLFormElement>(null), stepChanged=useRef(false), errorRef=useRef<HTMLDivElement>(null);
  const register=mode==='register';
  useEffect(()=>{if(stepChanged.current)formRef.current?.querySelector<HTMLElement>('input,[role=combobox],[data-summary]')?.focus();},[step]);
  useEffect(()=>{if(error){const field=formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');(field||errorRef.current)?.focus();}},[error,errors]);
  function changeStep(next:number){setError('');setErrors({});stepChanged.current=true;setStep(next);}
  async function submit(e:FormEvent){
    e.preventDefault();if(busy)return;
    const invalid:Record<string,string>={};
    if(!register||step===0){
      if(!/^\S+@\S+\.\S+$/.test(email.trim()))invalid.email='Escribe un correo electrónico válido.';
      if(mode!=='reset'&&!password)invalid.password='Escribe tu contraseña.';
      if(register){
        if(name.trim().length<2)invalid.name='Escribe tus nombres.';
        if(surname.trim().length<2)invalid.surname='Escribe tus apellidos.';
        if(password.length<8)invalid.password='Usa al menos 8 caracteres.';
      }
    }
    if(register&&step===1&&!stage)invalid.stage='Selecciona tu etapa educativa.';
    if(register&&step===2&&!consent)invalid.consent='Acepta guardar tu perfil y tus respuestas para crear la cuenta.';
    setErrors(invalid);
    if(Object.keys(invalid).length){setError('Revisa los campos indicados para continuar.');return;}
    setError('');
    if(register&&step<2){changeStep(step+1);return;}
    setBusy(true);
    try{
      await onSubmit({email:email.trim(),password:mode==='reset'?undefined:password,name:(name+' '+surname).trim(),stage});
      setPassword('');if(mode==='reset')setDone(true);
    }catch(e){setError((e as Error).message);}finally{setBusy(false);}
  }
  if(done)return <div className="stack" role="status"><CheckCircle2/><h2>Revisa tu correo</h2><p className="muted">Si el correo tiene una cuenta, recibirás un enlace para restablecer tu contraseña.</p><Button onClick={()=>onNavigate('login')}>Volver al ingreso</Button></div>;
  return <form ref={formRef} className="auth-fields" onSubmit={submit} noValidate aria-label={register?'Crear cuenta':'Acceso a tu cuenta'}>
    {register&&<Stepper labels={['Tu cuenta','Tu perfil','Comenzar']} current={step}/>}
    {error&&<div ref={errorRef} tabIndex={-1} className="auth-error"><Notice tone="danger">{error}</Notice></div>}
    {register&&step===0&&<div className="auth-name-fields">
      <Field label="Nombres" value={name} onChange={e=>setName(e.target.value)} autoComplete="given-name" error={errors.name} required/>
      <Field label="Apellidos" value={surname} onChange={e=>setSurname(e.target.value)} autoComplete="family-name" error={errors.surname} required/>
    </div>}
    {(!register||step===0)&&<>
      <Field label={'Correo electrónico'} type="email" inputMode="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" autoCapitalize="none" spellCheck={false} placeholder="nombre@correo.com" error={errors.email} required/>
      {mode!=='reset'&&<div><PasswordField label="Contraseña" value={password} onChange={setPassword} error={errors.password} autoComplete={register?'new-password':'current-password'}/>{register&&<p className="auth-field-hint">Usa al menos 8 caracteres.</p>}</div>}
    </>}
    {register&&step===1&&<>
      <SelectField label="¿En qué etapa estás?" value={stage} onChange={e=>setStage(e.target.value)} error={errors.stage} required><option value="">Selecciona una opción</option><option>Bachillerato (18 años o más)</option><option>Me gradué del colegio</option><option>Busco mi primera carrera universitaria</option></SelectField>

    </>}
    {register&&step===2&&<>
      <div className="auth-summary" data-summary tabIndex={-1}><h2>Revisa tus datos</h2><dl><div><dt>Nombre</dt><dd>{name} {surname}</dd></div><div><dt>Correo</dt><dd>{email}</dd></div><div><dt>Tu perfil</dt><dd>{stage}</dd></div></dl></div>
      <div><Checkbox checked={consent} onChange={e=>setConsent(e.target.checked)} aria-invalid={!!errors.consent} aria-describedby={errors.consent?'consent-error':undefined} label="Acepto guardar mi perfil y mis respuestas para construir mi ruta vocacional."/>{errors.consent&&<p id="consent-error" className="error-text auth-field-hint">{errors.consent}</p>}</div>
    </>}
    {(mode==='login'||mode==='admin')&&<div className="auth-recovery"><button type="button" className="text-link" onClick={()=>onNavigate('reset')}>Olvidé mi contraseña</button></div>}
    <div className="auth-actions">{register&&step>0&&<Button variant="secondary" disabled={busy} onClick={()=>changeStep(step-1)}>Atrás</Button>}<Button className="grow" type="submit" loading={busy} icon={register?<ArrowRight size={18}/>:undefined}>{register?step<2?'Continuar':'Crear mi cuenta':mode==='reset'?'Enviar instrucciones':mode==='admin'?'Ingresar al panel':'Ingresar'}</Button></div>
  </form>;
}
