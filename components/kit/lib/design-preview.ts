// Browser-only rehearsal. No server account and no plaintext password storage.
const key='rv360:design-account',activeKey='rv360:design-active';
function read(){try{return JSON.parse(sessionStorage.getItem(key)||'null');}catch{return null;}}
function write(account:any){sessionStorage.setItem(key,JSON.stringify(account));}
export function designLogout(){sessionStorage.setItem(activeKey,'signed-out');}
export function designSave(key:string,value:unknown){const account=read();if(account){account.values[key]=value;write(account);}}
async function verifier(password:string,salt:string){const material=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:100000,hash:'SHA-256'},material,256);return Array.from(new Uint8Array(bits),v=>v.toString(16).padStart(2,'0')).join('');}
// Isolated synthetic design context. No network, credentials or database.
export async function designRequest(path:string,options:RequestInit={}){
 const body=options.body?JSON.parse(String(options.body)):{};
 if(path==='auth/register'&&options.method==='POST'){
  if(!body.name?.trim()||!/^\S+@\S+\.\S+$/.test(body.email||'')||typeof body.password!=='string'||body.password.length<8||body.password.length>128)throw Error('Revisa nombre, correo y contraseña (8 a 128 caracteres).');
  if(read())throw Error('Ya hay una cuenta de prueba en esta pestaña. Ingresa con ella o abre una pestaña nueva.');
  const salt=crypto.randomUUID(),user={id:'design-'+crypto.randomUUID(),name:body.name.trim(),email:body.email.trim().toLowerCase(),role:'student',institutionId:'design',group:''};
  const {password,admin,...profile}=body;
  write({user,salt,verifier:await verifier(password,salt),values:{'rv360:profile':{...profile,name:user.name,email:user.email}}});sessionStorage.setItem(activeKey,'yes');return {user};
 }
 if(path==='auth/login'&&options.method==='POST'){
  const account=read();if(body.admin||!account||account.user.email!==String(body.email).trim().toLowerCase()||typeof body.password!=='string'||account.verifier!==await verifier(body.password,account.salt))throw Error('No coincide con la cuenta de prueba de esta pestaña. Revisa tus datos o crea una cuenta de prueba.');
  sessionStorage.setItem(activeKey,'yes');return {user:account.user};
 }
 if(path==='account/profile'&&options.method==='PUT'){
  const account=read();if(!account||sessionStorage.getItem(activeKey)!=='yes')throw Error('Crea una cuenta de prueba para editar tus datos en esta pestaña.');
  if(!body.firstName?.trim()||!body.lastName?.trim())throw Error('Completa nombres y apellidos.');
  account.user.name=body.firstName.trim()+' '+body.lastName.trim();account.values['rv360:profile']={...account.values['rv360:profile'],...body,name:account.user.name,email:account.user.email};write(account);return {ok:true};
 }
 if(options.method&&options.method!=='GET')throw Error('Vista de diseño: esta operación se habilitará al conectar la base de datos. No se ha guardado ni enviado información.');
 if(path==='session'){
  const admin=location.pathname.startsWith('/admin'),account=read(),active=sessionStorage.getItem(activeKey);
  if(!admin&&account&&active==='yes')return {user:account.user,values:account.values,revisions:{},mailConfigured:false};
  const publicPage=['/','/ingresar','/registro','/recuperar','/admin/login','/restablecer'].includes(location.pathname.replace(/\/$/,'')||'/');
  return {user:publicPage||(!admin&&active==='signed-out')?null:{id:'design-preview',name:admin?'Administrador':'Estudiante de muestra',email:'diseno@example.test',role:admin?'admin':'student',institutionId:'design',group:''},values:{'rv360:admin-users':[],'rv360:submissions':[],'rv360:admin-settings':{name:'Ruta Vocacional 360°'},'rv360:profile':{name:admin?'Administrador':'Estudiante de muestra',email:'diseno@example.test'}},revisions:{},mailConfigured:false};
 }
 if(path==='reports/guidance')return {items:[],configured:false};
 if(path==='admin/analytics')return {students:0,active:0,started:0,completed:0,reports:0,recent:[],studentProgress:[],groups:[],byTest:[],activity:[]};
 return {items:[]};
}
