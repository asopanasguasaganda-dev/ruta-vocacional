export function simulatorClock(startedAt:string,expiresAt:string|null,now:number,offset=0){
 const current=now+(Number.isFinite(offset)?offset:0),start=Date.parse(startedAt),end=expiresAt?Date.parse(expiresAt):NaN;
 return {elapsed:Number.isFinite(start)?Math.max(0,Math.floor((current-start)/1000)):0,remaining:Number.isFinite(end)?Math.max(0,Math.ceil((end-current)/1000)):null};
}
export function clockLabel(seconds:number){return Math.floor(seconds/60).toString().padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');}
