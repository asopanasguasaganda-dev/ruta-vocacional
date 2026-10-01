import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {writeFileSync} from 'node:fs';

export async function runGuidanceVisual({base,password,folder}){
 const require=createRequire(import.meta.url);
 let playwright;try{playwright=require('playwright');}catch{playwright=require('../.qa-tools/node_modules/playwright');}
 const browser=await playwright.chromium.launch({headless:true,...(process.platform==='win32'?{executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'}:{})});
 const failures=[],checks=[];
 async function choose(page,label,option){await page.getByRole('combobox',{name:label,exact:true}).click();await page.getByRole('option',{name:option,exact:true}).click();}
 async function shot(page,name){await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:resolve(folder,name+'.png'),fullPage:true});await page.screenshot({path:resolve(folder,name+'-viewport.png')});}
 async function overflow(page,name){
  const data=await page.evaluate(()=>({width:innerWidth,overflow:document.documentElement.scrollWidth-innerWidth,culprits:[...document.querySelectorAll('main *')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.right>innerWidth+2&&getComputedStyle(e).position!=='fixed';}).slice(0,8).map(e=>({tag:e.tagName,class:e.className,width:e.getBoundingClientRect().width}))}));
  checks.push({name,...data});if(data.overflow>2)failures.push({name,...data});
 }
 async function login(page,admin=false){
  await page.goto(base+(admin?'/admin/login':'/ingresar'));
  await page.getByLabel('Correo electrónico',{exact:true}).fill(admin?'admin@example.test':'test@example.test');
  await page.getByLabel('Contraseña',{exact:true}).fill(password);
  await page.getByRole('button',{name:admin?'Ingresar al panel':'Ingresar',exact:true}).click();
  await page.waitForURL(admin?'**/admin':'**/mi-ruta');
 }
 try{
  const registrationContext=await browser.newContext({viewport:{width:1366,height:900}}),registration=await registrationContext.newPage();
  registration.on('pageerror',error=>failures.push({name:'Registration JavaScript',message:error.message}));
  await registration.goto(base+'/registro');
  await registration.getByRole('button',{name:'Continuar',exact:true}).click();
  await registration.getByText('Revisa los campos indicados para continuar.',{exact:true}).waitFor();
  await registration.getByLabel('Nombres',{exact:true}).fill('Estudiante');await registration.getByLabel('Apellidos',{exact:true}).fill('Explorando');
  await registration.getByLabel('Correo electrónico',{exact:true}).fill('visual-'+Date.now()+'@example.test');await registration.getByLabel('Contraseña',{exact:true}).fill(password);
  await registration.getByRole('button',{name:'Continuar',exact:true}).click();
  await choose(registration,'¿En qué etapa estás?','Estoy eligiendo mi bachillerato');
  assert.equal(await registration.getByRole('combobox',{name:'Bachillerato que cursas, cursaste o has elegido',exact:true}).count(),0);
  assert.equal(await registration.getByRole('combobox',{name:'¿Qué te gustaría priorizar al aprender?',exact:true}).count(),0);
  await shot(registration,'registro-sin-eleccion');await overflow(registration,'registro-sin-eleccion');
  await registration.getByRole('button',{name:'Continuar',exact:true}).click();
  await registration.getByRole('checkbox').check();await registration.getByRole('button',{name:'Crear mi cuenta',exact:true}).click();await registration.waitForURL('**/mi-ruta');
  await registration.getByRole('heading',{name:'¿Qué bachillerato puedo elegir?',exact:true}).waitFor();
  const registered=await registration.request.get(base+'/api/session');const data=await registered.json();assert.equal(data.values['rv360:profile'].baccalaureate,'por-definir');
  await registration.reload();await registration.getByRole('heading',{name:'¿Qué bachillerato puedo elegir?',exact:true}).waitFor();await shot(registration,'inicio-sin-eleccion');
  await registration.setViewportSize({width:390,height:844});await overflow(registration,'inicio-sin-eleccion-movil');await shot(registration,'inicio-sin-eleccion-movil');
  await registrationContext.close();
  const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage();
  page.on('pageerror',error=>failures.push({name:'JavaScript',message:error.message}));
  page.on('console',message=>{if(message.type()==='error')failures.push({name:'Browser console',message:message.text()});});
  await login(page);
  await page.goto(base+'/mi-ruta/perfil');
  await choose(page,'Etapa educativa','Estoy eligiendo mi bachillerato');
  await choose(page,'Bachillerato que cursas, cursaste o has elegido','Bachillerato Técnico');
  await page.getByRole('combobox',{name:'Especialidad o figura profesional',exact:true}).fill('Informática');
  await page.getByRole('combobox',{name:'Especialidad o figura profesional',exact:true}).press('Tab');
  await choose(page,'¿Qué te gustaría priorizar al aprender?','Aprender un oficio o especialidad mediante proyectos y práctica');
  await page.getByRole('button',{name:'Guardar cambios',exact:true}).click();
  await page.getByText('Tus datos se guardaron.',{exact:true}).waitFor();
  await shot(page,'perfil-escritorio');await overflow(page,'perfil-escritorio');
  await page.reload();assert.equal(await page.getByRole('combobox',{name:'Especialidad o figura profesional',exact:true}).inputValue(),'Informática');
  await page.goto(base+'/mi-ruta/resultados');
  await page.getByRole('heading',{name:'Tu perfil muestra afinidad con Bachillerato en Ciencias',exact:true}).waitFor();
  await shot(page,'resultados-escritorio');await overflow(page,'resultados-escritorio');
  await page.getByRole('region',{name:'Orientación de bachillerato'}).screenshot({path:resolve(folder,'bachillerato-detalle.png')});
  await page.getByRole('button',{name:'Informe PDF',exact:true}).click();
  await page.getByRole('link',{name:'Descargar PDF',exact:true}).waitFor();
  await page.locator('.pdf-viewer-viewport[aria-busy="false"]').waitFor({timeout:60000});
  assert(await page.locator('.pdf-viewer canvas').isVisible());
  await shot(page,'pdf-escritorio');
  await page.getByRole('button',{name:'Página siguiente del PDF'}).click();
  await page.getByText('Página 2 de',{exact:false}).waitFor();
  await page.locator('.pdf-viewer-viewport[aria-busy="false"]').waitFor();
  const pdf=await page.getByRole('link',{name:'Descargar PDF',exact:true}).getAttribute('href');assert(pdf.startsWith('blob:'));
  const downloadPromise=page.waitForEvent('download');await page.getByRole('link',{name:'Descargar PDF',exact:true}).click();const download=await downloadPromise;await download.saveAs(resolve(folder,'informe-descargado.pdf'));
  await page.getByRole('button',{name:'Bachillerato',exact:true}).click();
  assert.equal(await page.locator('.rd-recommended').count(),0,'University cards belong in Universidad');
  await page.getByRole('button',{name:'Universidad',exact:true}).click();
  const link=page.getByRole('button',{name:'Conocer la carrera',exact:true}).first();await link.click();await page.getByRole('dialog').waitFor();await shot(page,'carrera-dialogo');await page.keyboard.press('Escape');
  for(const width of [390,768,1280]){
   await page.setViewportSize({width,height:900});
   await page.goto(base+'/mi-ruta/resultados');await page.getByRole('heading',{name:'Tu perfil muestra afinidad con Bachillerato en Ciencias',exact:true}).waitFor();
   await shot(page,'resultados-'+width);await overflow(page,'resultados-'+width);
   if(width===390){
    await page.getByRole('button',{name:'Informe PDF',exact:true}).click();
    await page.locator('.pdf-viewer canvas').waitFor({state:'visible',timeout:60000});
    await overflow(page,'pdf-movil');await shot(page,'pdf-movil');
   }
   await page.goto(base+'/mi-ruta/perfil');await page.getByRole('combobox',{name:'Especialidad o figura profesional',exact:true}).waitFor();await shot(page,'perfil-'+width);await overflow(page,'perfil-'+width);
  }
  await choose(page,'Bachillerato que cursas, cursaste o has elegido','Bachillerato en Ciencias');
  assert.equal(await page.getByRole('combobox',{name:'Especialidad o figura profesional',exact:true}).count(),0);
  await choose(page,'¿Qué te gustaría priorizar al aprender?','Profundizar en asignaturas, investigar y argumentar');
  await page.getByRole('button',{name:'Guardar cambios',exact:true}).click();await page.getByText('Tus datos se guardaron.',{exact:true}).waitFor();
  await page.goto(base+'/mi-ruta/resultados');await page.getByRole('heading',{name:'Tu perfil muestra afinidad con Bachillerato en Ciencias',exact:true}).waitFor();await shot(page,'ciencias-1280');
  await page.getByRole('button',{name:'Universidad',exact:true}).click();
  assert.equal(await page.locator('.rd-recommended').count(),8);
  await page.locator('.rd-offer-details summary').first().click();await page.locator('.career-offers').first().waitFor();await shot(page,'universidades');
  const admin=await browser.newContext({viewport:{width:1440,height:1000}}),ap=await admin.newPage();ap.on('pageerror',error=>failures.push({name:'Admin JavaScript',message:error.message}));
  await login(ap,true);await ap.goto(base+'/admin/resultados');
  await ap.getByRole('button',{name:'Ver ficha de Estudiante Prueba'}).click();
  const refreshed=ap.waitForResponse(r=>r.url().includes('/api/reports/guidance')&&r.request().method()==='POST');
  await ap.getByRole('button',{name:'Actualizar orientación de bachillerato y universidad'}).click();
  assert.equal((await refreshed).status(),200);
  await ap.waitForFunction(()=>[...document.querySelectorAll('button')].some(b=>b.textContent.includes('Actualizar orientación de bachillerato y universidad')&&!b.disabled));
  await ap.getByRole('button',{name:'Bachillerato',exact:true}).click();
  await ap.getByRole('heading',{name:'Tu perfil muestra afinidad con Bachillerato en Ciencias',exact:true}).waitFor();
  await ap.getByRole('button',{name:'Universidad',exact:true}).click();
  assert.equal(await ap.locator('.rd-recommended').count(),8);
  await shot(ap,'admin-universidad');await overflow(ap,'admin-universidad');
  assert.equal(await ap.getByRole('button',{name:'Autopreparaci?n',exact:true}).count(),0);
  await ap.getByRole('button',{name:'Conocer la carrera',exact:true}).first().click();await ap.getByRole('dialog').waitFor();await ap.keyboard.press('Escape');
  await ap.getByRole('button',{name:'Recomendaciones',exact:true}).click();await ap.getByRole('heading',{name:'Recomendaciones para el estudiante',exact:true}).waitFor();
  await ap.getByRole('button',{name:'Bachillerato',exact:true}).click();
  await shot(ap,'admin-escritorio');await overflow(ap,'admin-escritorio');
  await ap.setViewportSize({width:390,height:844});await shot(ap,'admin-movil');await overflow(ap,'admin-movil');
  await ap.getByRole('button',{name:'Universidad',exact:true}).click();await shot(ap,'admin-universidad-movil');await overflow(ap,'admin-universidad-movil');
  checks.push({name:'Flujo',passed:'Acceso por formularios, perfil persistido, orientación independiente de la modalidad declarada, conexión de carrera, descarga PDF y actualización administrativa.'});
 }catch(error){
  failures.push({name:'Workflow',message:error.message});
  for(const [i,context] of browser.contexts().entries())for(const [j,page] of context.pages().entries())await shot(page,'failure-'+i+'-'+j).catch(()=>{});
  throw error;
 }finally{
  writeFileSync(resolve(folder,'visual-results.json'),JSON.stringify({checks,failures},null,2));
  await browser.close();
 }
 console.log('Visual evidence: '+folder);
 assert.equal(failures.length,0,JSON.stringify(failures));
 console.log('PASS visual workflow: desktop/mobile layouts, forms, persistence, recommendations, career dialog, PDF download and admin.');
}
