import {Children,isValidElement,Fragment,useState,useRef,useEffect} from 'react';
import type {ReactNode,SelectHTMLAttributes,ChangeEvent} from 'react';
import {Select} from '@base-ui/react/select';
import {ChevronDown,Check} from 'lucide-react';
export function StyledSelect({children,value,defaultValue,onChange,id,name,disabled,required,...props}:SelectHTMLAttributes<HTMLSelectElement>){
 const trigger=useRef<HTMLButtonElement>(null),[container,setContainer]=useState<HTMLElement|null>(null);useEffect(()=>{setContainer(trigger.current?.closest('dialog')||null);},[]);
 const items:{value:string;label:ReactNode;disabled?:boolean}[]=[];
 function read(nodes:ReactNode){Children.forEach(nodes,node=>{if(!isValidElement(node))return;const p=node.props as any;if(node.type==='option')items.push({value:String(p.value??p.children??''),label:p.children,disabled:p.disabled});else if(node.type===Fragment||node.type==='optgroup')read(p.children);});}read(children);
 const [local,setLocal]=useState(String(defaultValue??items[0]?.value??''));const selected=value===undefined?local:String(value);
 return <Select.Root items={items} value={selected} name={name} disabled={disabled} required={required} modal={false} onValueChange={v=>{const next=String(v??'');setLocal(next);onChange?.({target:{value:next,name,id},currentTarget:{value:next,name,id}} as ChangeEvent<HTMLSelectElement>);}}><Select.Trigger ref={trigger} id={id} className="rv-select-trigger" aria-invalid={props['aria-invalid']} aria-describedby={props['aria-describedby']} aria-label={props['aria-label']}><Select.Value/><Select.Icon><ChevronDown size={17}/></Select.Icon></Select.Trigger><Select.Portal container={container||undefined}><Select.Positioner sideOffset={6} className="rv-select-positioner" alignItemWithTrigger={false}><Select.Popup className="rv-select-popup"><Select.List>{items.map((o,i)=><Select.Item key={o.value+':'+i} value={o.value} disabled={o.disabled} className="rv-select-item"><Select.ItemText>{o.label}</Select.ItemText><Select.ItemIndicator><Check size={16}/></Select.ItemIndicator></Select.Item>)}</Select.List></Select.Popup></Select.Positioner></Select.Portal></Select.Root>;
}
