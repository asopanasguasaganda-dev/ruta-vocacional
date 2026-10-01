import 'server-only';
import type {SessionUser} from '@/components/kit/lib/session';
import {currentUser} from './store';
/** Pages and API requests share the same central database session. */
export async function currentPageUser():Promise<SessionUser|null>{return currentUser();}
