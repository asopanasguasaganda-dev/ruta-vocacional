const http=require('node:http'),fs=require('node:fs/promises'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(require('node:fs').readFileSync(f,'utf8'),{compilerOptions:{module:1,target:9,esModuleInterop:true}}).outputText,f);
const {validateTestPublication}=require('../components/kit/lib/test-publication.ts');
function createDesignServer({root=path.resolve('.design-preview/out'),file=path.resolve('.local/design-publications.json')}={}){
 let writes=Promise.resolve();
 const read=async()=>{try{const data=JSON.parse(await fs.readFile(file,'utf8'));if(data.format!=='rv360-shared-catalog'||!Array.isArray(data.publications))throw Error('Catálogo compartido inválido.');return data;}catch(e){if(e.code==='ENOENT')return {format:'rv360-shared-catalog',publications:[]};throw e;}};
 return http.createServer(async(req,res)=>{
 const json=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(data));};
 try{
 const hostname=new URL('http://'+req.headers.host).hostname;
 if(!['localhost','127.0.0.1','[::1]'].includes(hostname))return json(403,{error:'Este servidor solo admite pruebas locales.'});
 const url=new URL(req.url,'http://'+req.headers.host);
 if(url.pathname==='/__design/publications'){
 if(req.method==='GET'){await writes;return json(200,await read());}
 if(req.method!=='PUT')return json(405,{error:'Método no admitido.'});
 if(req.headers.origin!=='http://'+req.headers.host)return json(403,{error:'Origen no permitido.'});
 if(!String(req.headers['content-type']).startsWith('application/json'))return json(415,{error:'Usa JSON.'});
 let body='',length=0;for await(const chunk of req){length+=chunk.length;if(length>10*1024*1024)return json(413,{error:'La publicación supera 10 MB.'});body+=chunk;}
 const packet=validateTestPublication(JSON.parse(body));
 const task=writes.then(async()=>{
 const data=await read(),prior=data.publications.find(p=>p.source===packet.source);
 if(prior&&Date.parse(packet.createdAt)<Date.parse(prior.createdAt))throw Error('Existe una publicación más reciente. Actualiza el catálogo.');
 const clean={format:packet.format,version:packet.version,source:packet.source,createdAt:packet.createdAt,tests:packet.tests,...(packet.version===2?{simulators:packet.simulators}:{})};
 data.publications=[...data.publications.filter(p=>p.source!==packet.source),clean];
 if(Buffer.byteLength(JSON.stringify(data))>30*1024*1024)throw Error('El catálogo compartido supera 30 MB.');
 await fs.mkdir(path.dirname(file),{recursive:true});const temp=file+'.tmp';await fs.writeFile(temp,JSON.stringify(data,null,2),'utf8');await fs.rename(temp,file);
 });writes=task.catch(()=>{});await task;return json(200,{ok:true});
 }
 if(!['GET','HEAD'].includes(req.method))return json(405,{error:'Método no admitido.'});
 let target=path.resolve(root,'.'+decodeURIComponent(url.pathname));if(target!==root&&!target.startsWith(root+path.sep))return json(403,{error:'Ruta no permitida.'});
 let stat;try{stat=await fs.stat(target);}catch{return json(404,{error:'Ejecuta npm run build:design antes de iniciar el servidor.'});}
 if(stat.isDirectory())target=path.join(target,'index.html');
 const bytes=await fs.readFile(target),mime={'.html':'text/html; charset=utf-8','.js':'application/javascript','.mjs':'application/javascript','.css':'text/css','.json':'application/json','.txt':'text/plain','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2','.mp4':'video/mp4'};
 res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:bytes);
 }catch(e){json(400,{error:e.message||'No se pudo procesar la publicación.'});}
 });
}
module.exports={createDesignServer};
if(require.main===module){const port=Number(process.env.DESIGN_PORT||3000);createDesignServer().listen(port,'127.0.0.1',()=>console.log('Diseño sin base de datos: http://localhost:'+port+' — ambos navegadores deben abrir esta dirección.'));}
