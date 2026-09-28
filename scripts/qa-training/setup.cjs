// Only the isolated QA database. Never opens storage/ruta.sqlite.
const {DatabaseSync}=require('node:sqlite'),{randomUUID}=require('node:crypto'),fs=require('node:fs');
const file='.qa-tools/constructor-qa.sqlite';
if(!fs.existsSync(file))throw Error('Inicia primero el servidor con DATABASE_PATH=.qa-tools/constructor-qa.sqlite y puerto 3006.');
const db=new DatabaseSync(file);
if(!db.prepare("SELECT id FROM users WHERE role='admin'").get()){
 const org=randomUUID();db.prepare('INSERT INTO institutions VALUES(?,?,?)').run(org,'Plataforma QA aislada','QA-COURSES');
 db.prepare('INSERT INTO users VALUES(?,?,?,?,?,?,?,?)').run(randomUUID(),'Administración QA','admin.cursos@example.test','disabled-test-account','admin',org,'','Activo');
}
db.close();console.log('QA lista. Las sesiones de prueba se generan localmente, sin contraseñas de producción.');
