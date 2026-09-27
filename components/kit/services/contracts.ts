import type { Career, User } from "../types";
/** Contratos propuestos para conectar el kit. No son servicios implementados. */
export interface Session {
  userId: string;
  role: "student" | "counselor" | "admin";
  institutionId: string | null;
  expiresAt: string;
}
export interface SaveAnswersRequest {
  instrumentId: string;
  instrumentVersion: string;
  answers: Record<string, number>;
  revision: number;
}
export interface AssessmentSubmission {
  id: string;
  instrumentId: string;
  instrumentVersion: string;
  status: "draft" | "submitted";
  answered: number;
  total: number;
  updatedAt: string;
  revision: number;
}
export interface ApiError {
  code:
    | "UNAUTHENTICATED"
    | "FORBIDDEN"
    | "VALIDATION"
    | "CONFLICT"
    | "RATE_LIMITED"
    | "UNAVAILABLE";
  message: string;
  fields?: Record<string, string>;
}
export interface AuthService {
  signIn(input: {
    email: string;
    password: string;
    institutionCode?: string;
  }): Promise<Session>;
  register(input: {
    name: string;
    email: string;
    password: string;
    stage: string;
    consentVersion: string;
  }): Promise<{ verificationRequired: boolean }>;
  requestPasswordReset(email: string): Promise<void>;
  signOut(): Promise<void>;
  getSession(): Promise<Session | null>;
}
export interface AssessmentService {
  getDraft(
    instrumentId: string,
    version: string,
  ): Promise<AssessmentSubmission & { answers: Record<string, number> }>;
  saveDraft(input: SaveAnswersRequest): Promise<AssessmentSubmission>;
  submit(input: SaveAnswersRequest): Promise<AssessmentSubmission>;
}
export interface CareerService {
  list(input: {
    query?: string;
    area?: string;
    cursor?: string;
  }): Promise<{ items: Career[]; nextCursor: string | null }>;
  setSaved(careerId: string, saved: boolean): Promise<void>;
}
export interface UserService {
  list(input: {
    query?: string;
    role?: string;
    group?: string;
    cursor?: string;
  }): Promise<{ items: User[]; nextCursor: string | null }>;
  update(id: string, patch: Partial<Omit<User, "id">>): Promise<User>;
}
export interface ContentPublication {
  id: string;
  version: string;
  status: "draft" | "in_review" | "published" | "archived";
  reviewedBy: string | null;
  publishedAt: string | null;
}
