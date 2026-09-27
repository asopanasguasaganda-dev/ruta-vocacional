import {
  answerKey,
  awareness,
  completion,
  interests,
  preferences,
} from "../data/instruments";
import { isNumberRecord, useLocalState } from "./storage";
import { useSession } from './session';
export function useAssessment() {
  const session=useSession();
  const submitted=[interests,preferences,awareness].map(instrument=>(session.values['rv360:submissions']||[]).some((s:any)=>s.instrument_id===instrument.id&&s.version===instrument.version));
  const [interestAnswers] = useLocalState<Record<string, number>>(
    answerKey(interests),
    {},
    isNumberRecord,
  );
  const [preferenceAnswers] = useLocalState<Record<string, number>>(
    answerKey(preferences),
    {},
    isNumberRecord,
  );
  const [awarenessAnswers] = useLocalState<Record<string, number>>(
    answerKey(awareness),
    {},
    isNumberRecord,
  );
  const counts = [
    completion(interests, interestAnswers),
    completion(preferences, preferenceAnswers),
    completion(awareness, awarenessAnswers),
  ];
  const totals = [
    interests.questions.length,
    preferences.questions.length,
    awareness.questions.length,
  ];
  return {
    interestAnswers,
    preferenceAnswers,
    awarenessAnswers,
    counts,
    totals,
    submitted,
    complete: submitted.filter(Boolean).length,
  };
}
