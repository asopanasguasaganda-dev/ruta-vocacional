export type LabConfig={instructions:string;rounds:number;digits:number;delayMin:number;delayMax:number};
export const labDefaults:Record<string,LabConfig>={
 attention:{instructions:'Encuentra el símbolo diferente. Observa todas las opciones antes de responder.',rounds:4,digits:5,delayMin:1200,delayMax:3000},
 memory:{instructions:'Observa una secuencia, ocúltala cuando quieras y escríbela en el mismo orden.',rounds:1,digits:5,delayMin:1200,delayMax:3000},
 flexibility:{instructions:'Clasifica el número según la regla de cada ronda. La regla cambia entre paridad y comparación con 5.',rounds:4,digits:5,delayMin:1200,delayMax:3000},
 control:{instructions:'Si aparece RESPONDER, pulsa Responder. Si aparece DEJAR PASAR, elige Dejar pasar.',rounds:4,digits:5,delayMin:1200,delayMax:3000},
 speed:{instructions:'Inicia el intento y espera la señal verde. Pulsa Responder cuando aparezca; evita anticiparte.',rounds:1,digits:5,delayMin:1200,delayMax:3000},
};
export const labTitles:Record<string,string>={attention:'Atención',memory:'Memoria',flexibility:'Flexibilidad',control:'Control de respuesta',speed:'Tiempo de respuesta'};
export function labConfig(value:any,id:string):LabConfig{return {...labDefaults[id],...(value?.[id]||{})};}
export function labSettingsProblem(value:any){if(!value||typeof value!=='object'||Array.isArray(value))return 'Configuración de actividades no válida.';for(const [id,c] of Object.entries(value) as [string,any][]){if(!labDefaults[id]||!c||typeof c.instructions!=='string'||!c.instructions.trim()||c.instructions.length>1500)return 'Revisa las instrucciones de cada actividad.';if(!Number.isInteger(c.rounds)||c.rounds<1||c.rounds>20||!Number.isInteger(c.digits)||c.digits<3||c.digits>9||!Number.isInteger(c.delayMin)||!Number.isInteger(c.delayMax)||c.delayMin<500||c.delayMax>10000||c.delayMax<c.delayMin)return 'Usa entre 1 y 20 rondas, 3–9 dígitos y esperas entre 500 y 10000 ms.';}return '';}
