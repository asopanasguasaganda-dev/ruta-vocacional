import type {IncomingMessage,ServerResponse} from 'node:http';
import {publisherAuth} from './publisher-auth';
const auth=publisherAuth();
export default async function handler(req:IncomingMessage&{body?:any},res:ServerResponse){
 res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type','application/json');
 const send=(status:number,data:any)=>{res.statusCode=status;res.end(JSON.stringify(data));};
 if(req.method!=='GET'&&req.headers.origin&&req.headers.origin!==`https://${req.headers.host}`)return send(403,{error:'Origen no permitido.'});
 let body=req.body;try{if(typeof body==='string')body=JSON.parse(body);}catch{return send(400,{error:'Solicitud no válida.'});}
 const r=await auth.handle(req.method||'GET',body,req.headers.cookie||'',String(req.headers['x-publish-key']||''));
 if(r.token!==undefined)res.setHeader('Set-Cookie',`rv360_publisher=${r.token}; HttpOnly; Secure; SameSite=Strict; Path=/api; Max-Age=${r.token?86400:0}`);
 send(r.status,r.body);
}
