// Isolated synthetic design context. No network, credentials or database.
export function designRequest(path:string,options:RequestInit={}){
 if(options.method&&options.method!=='GET')throw Error('Vista de diseño: esta operación se habilitará al conectar la base de datos. No se ha guardado ni enviado información.');
 if(path==='session'){
  const admin=location.pathname.startsWith('/admin');
  const publicPage=['/','/ingresar','/registro','/recuperar','/admin/login','/restablecer'].includes(location.pathname.replace(/\/$/,'')||'/');
  return {user:publicPage?null:{id:'design-preview',name:admin?'Administrador':'Estudiante de muestra',email:'diseno@example.test',role:admin?'admin':'student',institutionId:'design',group:''},values:{'rv360:admin-users':[],'rv360:submissions':[],'rv360:admin-settings':{name:'Ruta Vocacional 360°'},'rv360:profile':{name:admin?'Administrador':'Estudiante de muestra',email:'diseno@example.test'}},revisions:{},mailConfigured:false};
 }
 if(path==='reports/guidance')return {items:[],configured:false};
 if(path==='admin/analytics')return {students:0,active:0,started:0,completed:0,reports:0,recent:[],studentProgress:[],groups:[],byTest:[],activity:[]};
 return {items:[]};
}
