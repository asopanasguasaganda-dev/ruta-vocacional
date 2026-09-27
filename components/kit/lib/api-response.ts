export async function readApiResponse(response:Response){
 if(!response.headers.get('content-type')?.includes('application/json'))throw new Error('El servicio no está disponible en esta dirección. Vuelve a intentarlo en la instalación conectada al servidor.');
 let data:any;try{data=await response.json();}catch{throw new Error('El servidor devolvió una respuesta incompleta. Vuelve a intentarlo.');}
 if(!response.ok)throw new Error(data.error||'No se pudo completar la operación.');return data;
}
