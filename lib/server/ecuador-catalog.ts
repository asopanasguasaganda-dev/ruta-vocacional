import {readFileSync} from 'node:fs';
import {join} from 'node:path';
type Offer={id:string;institution:string;funding:string;title:string;location:string;modality:string;accreditation:string};
type Career={id:string;name:string;interests:string[];description:string;area:string;activities:string;skills:string;investigate:string;offers:Offer[]};
const data: {source:string;sourceUrl:string;retrievedAt:string;sha256:string;careerCount:number;offerCount:number;filter:string;careers:Career[]}=JSON.parse(readFileSync(join(process.cwd(),'lib/server/data/ecuador-offer.json'),'utf8'));
export const catalogSource={source:data.source,sourceUrl:data.sourceUrl,date:data.retrievedAt,version:data.sha256,careerCount:data.careerCount,offerCount:data.offerCount,scope:data.filter};
export const ecuadorCareers=data.careers.map(({offers,...career})=>({...career,sourceUrl:data.sourceUrl,sourceDate:data.retrievedAt,offerCount:offers.length}));
export function careerOffers(ids:string[]){return Object.fromEntries(data.careers.filter(c=>ids.includes(c.id)).map(c=>[c.id,c.offers]));}
