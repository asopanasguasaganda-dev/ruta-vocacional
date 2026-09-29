import { DatabaseSync } from 'node:sqlite';
import { randomUUID,randomBytes,scryptSync } from 'node:crypto';
import { resolve } from 'node:path';
const {ADMIN_EMAIL,ADMIN_PASSWORD,ADMIN_NAME,INSTITUTION_NAME,INSTITUTION_CODE}=process.env;
if(!ADMIN_EMAIL||!ADMIN_PASSWORD||ADMIN_PASSWORD.length<12||!ADMIN_NAME||!INSTITUTION_NAME||!INSTITUTION_CODE)throw Error('Define ADMIN_EMAIL, ADMIN_PASSWORD (12 caracteres mínimo), ADMIN_NAME, INSTITUTION_NAME e INSTITUTION_CODE. Inicia primero la aplicación para preparar el almacenamiento.');
const db=new DatabaseSync(resolve(process.env.DATABASE_PATH||'storage/ruta.sqlite'));
const existing=db.prepare('SELECT id FROM institutions WHERE code=?').get(INSTITUTION_CODE);
const institutionId=existing?.id||randomUUID();const salt=randomBytes(16).toString('hex');
db.exec('BEGIN IMMEDIATE');try{if(!existing)db.prepare('INSERT INTO institutions VALUES(?,?,?)').run(institutionId,INSTITUTION_NAME,INSTITUTION_CODE);db.prepare('INSERT INTO users VALUES(?,?,?,?,?,?,?,?)').run(randomUUID(),ADMIN_NAME,ADMIN_EMAIL.toLowerCase(),salt+':'+scryptSync(ADMIN_PASSWORD,salt,64).toString('hex'),'admin',institutionId,'','Activo');const platform=db.prepare("SELECT value FROM documents WHERE owner='system' AND key='rv360:platform'").get();if(!platform)db.prepare('INSERT INTO documents(owner,key,value) VALUES(?,?,?)').run('system','rv360:platform',JSON.stringify({institutionId}));db.exec('COMMIT');console.log('Cuenta administrativa creada. Acceso: /admin/login');}catch(e){db.exec('ROLLBACK');throw e;}finally{db.close();}
