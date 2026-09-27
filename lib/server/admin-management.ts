import {randomUUID} from 'node:crypto';
import {db,document,put,fail,passwordHash} from './store';
import {instruments} from '@/components/kit/data/instruments';
import {listGuidance} from './guidance';
export function manageUser(admin:any,body:any){
 if(admin.role!=='admin')fail('Solo administración puede gestionar usuarios.',403);
 const existing=body.id?db.prepare('SELECT * FROM users WHERE id=?').get(String(body.id)) as any:null;
 if(body.id&&(!existing||existing.institutionId!==admin.institutionId||existing.role==='admin'))fail('Usuario no disponible.',404);
 if(body.action==='reset-password'){
  if(!existing)fail('Usuario no disponible.',404);
  if(typeof body.password!=='string'||body.password.length<8||body.password.length>128)fail('Usa una contraseña de 8 a 128 caracteres.');
  if(body.password!==body.confirmPassword)fail('Las contraseñas no coinciden.');
  const hashed=passwordHash(body.password);
  db.exec('BEGIN IMMEDIATE');try{
   db.prepare('UPDATE users SET password=? WHERE id=?').run(hashed,existing.id);
   db.prepare('DELETE FROM sessions WHERE userId=?').run(existing.id);
   db.prepare('DELETE FROM resets WHERE userId=?').run(existing.id);
   put('institution:'+admin.institutionId,'rv360:audit',[{name:admin.name,action:'Restablecer contraseña de usuario',entity:existing.id,created_at:new Date().toISOString()},...document('institution:'+admin.institutionId,'rv360:audit',[])].slice(0,1000));
   db.exec('COMMIT');
  }catch(e){db.exec('ROLLBACK');throw e;}
  return {ok:true};
 }
 if(body.action==='delete'){
  if(!existing)fail('Usuario no disponible.',404);
  if(db.prepare('SELECT id FROM submissions WHERE user_id=? LIMIT 1').get(existing.id))fail('Este usuario tiene evaluaciones guardadas. Suspende su acceso para conservar sus resultados.',409);
  db.exec('BEGIN IMMEDIATE');try{for(const table of ['sessions','resets'])db.prepare('DELETE FROM '+table+' WHERE userId=?').run(existing.id);db.prepare('DELETE FROM documents WHERE owner=?').run(existing.id);db.prepare('DELETE FROM users WHERE id=?').run(existing.id);db.exec('COMMIT');}catch(e){db.exec('ROLLBACK');throw e;}
 }else{
  const name=String(body.name||'').trim(),email=String(body.email||'').trim().toLowerCase(),group=String(body.group||'').trim(),role=body.role==='Orientador'?'orientador':body.role==='Estudiante'?'student':'';
  if(name.length<3||name.length>140||email.length>254||!/^\S+@\S+\.\S+$/.test(email)||!role||group.length>100||!['Activo','Suspendido','Invitación pendiente'].includes(body.status))fail('Revisa nombre, correo, rol y estado.');
  const duplicate=db.prepare('SELECT id FROM users WHERE email=?').get(email) as any;if(duplicate&&duplicate.id!==existing?.id)fail('Ese correo ya pertenece a otra cuenta.',409);
  if(!existing&&(typeof body.password!=='string'||body.password.length<8||body.password.length>128))fail('Define una contraseña inicial de al menos 8 caracteres.');
  db.exec('BEGIN IMMEDIATE');try{const id=existing?.id||randomUUID();if(existing){db.prepare('UPDATE users SET name=?,email=?,role=?,groupName=?,status=? WHERE id=?').run(name,email,role,group,body.status,id);if(existing.email!==email||existing.role!==role||body.status!=='Activo'){db.prepare('DELETE FROM sessions WHERE userId=?').run(id);db.prepare('DELETE FROM resets WHERE userId=?').run(id);}}else db.prepare('INSERT INTO users VALUES(?,?,?,?,?,?,?,?)').run(id,name,email,passwordHash(body.password),role,admin.institutionId,group,body.status);const profile=document(id,'rv360:profile',{});if(existing?.name!==name){delete profile.firstName;delete profile.lastName;}put(id,'rv360:profile',{...profile,name,email,stage:typeof body.stage==='string'?body.stage.slice(0,100):profile.stage||'',institution:typeof body.institution==='string'?body.institution.slice(0,120):profile.institution||''});db.exec('COMMIT');}catch(e){db.exec('ROLLBACK');throw e;}
 }
 put('institution:'+admin.institutionId,'rv360:audit',[{name:admin.name,action:body.action==='delete'?'Eliminar cuenta sin entregas':existing?'Editar usuario':'Crear usuario',entity:existing?.id||String(body.email),created_at:new Date().toISOString()},...document('institution:'+admin.institutionId,'rv360:audit',[])].slice(0,1000));return {ok:true};
}
export function adminAnalytics(user:any){
 if(user.role==='student')fail('No tienes acceso al seguimiento institucional.',403);
 const students=db.prepare('SELECT id,name,groupName,status FROM users WHERE institutionId IS ? AND role=?'+(user.role==='orientador'?' AND groupName=?':'')).all(...(user.role==='orientador'?[user.institutionId,'student',user.group]:[user.institutionId,'student'])) as any[];
 const ids=new Set(students.map(s=>s.id)),submissions=(db.prepare('SELECT s.* FROM submissions s JOIN users u ON u.id=s.user_id WHERE u.institutionId IS ? ORDER BY s.created_at DESC').all(user.institutionId) as any[]).filter(s=>ids.has(s.user_id)),reports=listGuidance(user),reportStudents=new Set(reports.filter(r=>r.status==='available').map(r=>r.student.id)),completed=new Set<string>(),started=new Set<string>();
 for(const student of students){const own=submissions.filter(s=>s.user_id===student.id),expected=document(student.id,'rv360:battery')?.instruments||instruments;if(expected.length&&expected.every((t:any)=>own.some(s=>s.instrument_id===t.id&&s.version===t.version)))completed.add(student.id);const drafts=db.prepare("SELECT value FROM documents WHERE owner=? AND key LIKE 'rv360:answers:%'").all(student.id) as any[];if(own.length||drafts.some(d=>Object.keys(JSON.parse(d.value)||{}).length))started.add(student.id);}
 const groups=[...new Set(students.map(s=>s.groupName||'Sin grupo'))].map(name=>{const members=students.filter(s=>(s.groupName||'Sin grupo')===name);return {name,total:members.length,started:members.filter(s=>started.has(s.id)).length,completed:members.filter(s=>completed.has(s.id)).length,reports:members.filter(s=>reportStudents.has(s.id)).length};});
 const day=(d:Date)=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Guayaquil'}).format(d);const activity=Array.from({length:14},(_,i)=>{const d=new Date();d.setDate(d.getDate()-13+i);const key=day(d);return {date:key,count:submissions.filter(s=>day(new Date(s.created_at))===key).length};});
 const byTest=Array.from(new Set(submissions.map(s=>s.instrument_id))).map(id=>{const own=submissions.filter(s=>s.instrument_id===id);return {id,title:JSON.parse(own[0].snapshot).title,count:own.length};}).sort((a,b)=>b.count-a.count);
 return {studentProgress:students.map(s=>({id:s.id,name:s.name,status:s.status,started:started.has(s.id),completed:completed.has(s.id),report:reportStudents.has(s.id)})),byTest,students:students.length,active:students.filter(s=>s.status==='Activo').length,started:started.size,completed:completed.size,reports:reportStudents.size,submissions:submissions.length,groups,activity,recent:submissions.slice(0,6).map(s=>({id:s.id,student:students.find(u=>u.id===s.user_id)?.name,title:JSON.parse(s.snapshot).title,date:s.created_at})),generatedAt:new Date().toISOString()};
}
