export type IntegralSection={title:string;lines:string[]};
export type IntegralReport={id:string;createdAt:string;student:{id:string;name:string};engineVersion:string;shared:boolean;attemptIds:string[];sections:IntegralSection[]};
export type IntegralSummary=Pick<IntegralReport,'id'|'createdAt'|'student'|'engineVersion'|'shared'>;
