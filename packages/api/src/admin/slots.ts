import { adminClient } from '../client';

export interface Slot {
  id: string;
  counselorId: string;
  startAt: string; // ISO 8601 e.g. "2026-02-11T09:00:00+09:00"
  endAt: string;
  capacity: number;
  bookedCount: number;
  status: string; // "OPEN" 등
}

/** POST /admin/slots 요청 - startAt, status만 */
export interface CreateSlotRequest {
  startAt: string; // ISO 8601 e.g. "2025-02-15T09:00:00"
  status?: string; // "OPEN" (기본)
}

/** PATCH /admin/slots/{id} 요청 */
export interface UpdateSlotRequest {
  startAt?: string;
  status?: string;
}

export const adminSlotsApi = {
  /** includeBookings 필수 (true 시 예약 목록 포함) */
  list: (params: { includeBookings: boolean }) =>
    adminClient.get<Slot[]>('/admin/slots', { params }),

  create: (data: CreateSlotRequest) =>
    adminClient.post<{ message: string; slot: Slot }>('/admin/slots', {
      ...data,
      status: data.status ?? 'OPEN',
    }),

  get: (id: string) => adminClient.get<Slot>(`/admin/slots/${id}`),

  update: (id: string, data: UpdateSlotRequest) =>
    adminClient.patch<Slot>(`/admin/slots/${id}`, data),

  delete: (id: string) => adminClient.delete(`/admin/slots/${id}`),
};
