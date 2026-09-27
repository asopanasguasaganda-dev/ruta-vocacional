import {NextRequest,NextResponse} from 'next/server';
import sharp from 'sharp';
import {mkdir,writeFile,readFile,unlink} from 'node:fs/promises';
import {resolve} from 'node:path';
import {randomUUID} from 'node:crypto';
import {requireUser,document,put,fail} from '@/lib/server/store';
export const runtime='nodejs';
const folder=()=>resolve(/* turbopackIgnore: true */ process.env.PROFILE_PHOTO_PATH||'storage/profile-photos');
async function handle(req:NextRequest){try{const user=await requireUser();const profile=document(user.id,'rv360:profile',{});if(req.method==='GET'){if(!/^[a-f0-9-]+\.webp$/.test(profile.photoFile||''))fail('Sin fotografía.',404);return new NextResponse(new Uint8Array(await readFile(resolve(folder(),profile.photoFile))),{headers:{'Content-Type':'image/webp','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});}
 if(req.headers.get('origin')!==new URL(req.url).origin||req.headers.get('sec-fetch-site')==='cross-site')fail('Origen no autorizado.',403);
 const old=profile.photoFile;
 if(req.method==='DELETE'){delete profile.photoFile;delete profile.photo;put(user.id,'rv360:profile',profile);}
 else {const max=Number(process.env.PROFILE_PHOTO_MAX_BYTES)||5*1024*1024;if(Number(req.headers.get('content-length')||0)>max+10000)fail('La foto supera el tamaño permitido.',413);const reader=req.body?.getReader();if(!reader)fail('Falta la imagen.');const chunks:Uint8Array[]=[];let size=0;while(true){const chunk=await reader!.read();if(chunk.done)break;size+=chunk.value.byteLength;if(size>max+10000){await reader!.cancel();fail('La foto supera el tamaño permitido.',413);}chunks.push(chunk.value);}const bounded=Buffer.concat(chunks);const form=await new Response(bounded,{headers:{'Content-Type':req.headers.get('content-type')||''}}).formData(),file=form.get('photo');if(!(file instanceof File)||file.size>max||!file.size)fail('Selecciona una foto de hasta 5 MiB.',413);const bytes=Buffer.from(await file.arrayBuffer());const magic=bytes.subarray(0,12);if(!(magic[0]===255&&magic[1]===216&&magic[2]===255||magic.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))||magic.toString('ascii',0,4)==='RIFF'&&magic.toString('ascii',8,12)==='WEBP'))fail('Utiliza una imagen JPG, PNG o WebP.');const meta=await sharp(bytes,{limitInputPixels:24000000}).metadata();if(!['jpeg','png','webp'].includes(meta.format||''))fail('Utiliza una imagen JPG, PNG o WebP.');const filename=randomUUID()+'.webp';const safe=await sharp(bytes,{limitInputPixels:24000000}).rotate().resize(400,400,{fit:'cover',position:'centre',withoutEnlargement:true}).webp({quality:85}).toBuffer();await mkdir(folder(),{recursive:true});await writeFile(resolve(folder(),filename),safe);put(user.id,'rv360:profile',{...profile,photoFile:filename,photo:'/api/account/photo?v='+filename});}
 if(/^[a-f0-9-]+\.webp$/.test(old||''))await unlink(resolve(folder(),old)).catch(()=>{});return NextResponse.json({ok:true});
 }catch(e:any){return NextResponse.json({error:e.status?e.message:'No se pudo procesar la imagen. Comprueba su formato y tamaño.'},{status:e.status||400});}}
export const GET=handle;export const POST=handle;export const DELETE=handle;
