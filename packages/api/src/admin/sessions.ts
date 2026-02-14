import { adminClient } from '../client';

/** POST /admin/bookings/{bookingId}/session - 상담 기록 저장 */
export const adminSessionsApi = {
  save: (bookingId: string, data: { notes?: string }) =>
    adminClient.post(`/admin/bookings/${bookingId}/session`, data),
};
