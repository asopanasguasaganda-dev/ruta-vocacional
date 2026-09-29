import type {IncomingMessage,ServerResponse} from 'node:http';
import {createPublicationService} from './design-publications';
import {publisherAuth} from './publisher-auth';

const service=createPublicationService();
export default async function handler(req:IncomingMessage&{body?:any},res:ServerResponse){
 res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('X-Content-Type-Options','nosniff');
 const send=(status:number,body:any)=>{res.statusCode=status;res.end(JSON.stringify(body));};
 if(req.method==='PUT'||req.method==='POST'){
 const origin=req.headers.origin;
 if(origin&&origin!==`https://${req.headers.host}`&&origin!==`http://${req.headers.host}`)return send(403,{error:'Origen no permitido.'});
 if(!req.headers['content-type']?.startsWith('application/json'))return send(415,{error:'Usa JSON.'});
 }
 let body=req.body;
 try{if(typeof body==='string')body=JSON.parse(body);}catch{return send(400,{error:'JSON no válido.'});}
 const authorized=req.method!=='GET'&&await publisherAuth().authenticated(req.headers.cookie||'');
 const result=await service(req.method||'GET',body,authorized?process.env.DESIGN_PUBLISH_KEY||'':String(req.headers['x-publish-key']||''));send(result.status,result.body);
}
