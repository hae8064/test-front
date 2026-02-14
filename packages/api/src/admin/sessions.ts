import { adminClient } from "../client";

export const SessionOutcome = {
  COMPLETED: "COMPLETED",
  NO_SHOW: "NO_SHOW",
  CANCELLED: "CANCELLED",
  FOLLOW_UP: "FOLLOW_UP",
} as const;

export type SessionOutcome =
  (typeof SessionOutcome)[keyof typeof SessionOutcome];

export interface SaveSessionRequest {
  notes?: string;
  outcome?: SessionOutcome;
}

export interface Session {
  id: string;
  bookingId: string;
  notes: { content?: string } | Record<string, unknown>;
  outcome: SessionOutcome;
  startedAt?: string;
  endedAt?: string;
}

/** GET /admin/bookings/{bookingId}/session - 상담 기록 조회 */
export const adminSessionsApi = {
  get: (bookingId: string) =>
    adminClient.get<Session>(`/admin/bookings/${bookingId}/session`),

  /** POST /admin/bookings/{bookingId}/session - 상담 기록 저장 (upsert) */
  save: (bookingId: string, data: SaveSessionRequest) =>
    adminClient.post(`/admin/bookings/${bookingId}/session`, {
      notes: data.notes ? { content: data.notes } : {},
      outcome: data.outcome ?? SessionOutcome.COMPLETED,
    }),
};
