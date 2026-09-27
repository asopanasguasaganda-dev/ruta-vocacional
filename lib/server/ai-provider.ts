// No transport accepting student data. Gemini public academic content only.
export {refreshAcademicContent} from './academic-content.mjs';
export const providerName=()=> 'gemini';
export const providerReady=()=>!!(process.env.GEMINI_API_KEY&&process.env.GEMINI_MODEL==='gemini-3.1-flash-lite');
