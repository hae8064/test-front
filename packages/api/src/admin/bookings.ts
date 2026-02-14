import { adminClient } from '../client';

export interface Applicant {
  id: string;
  email: string;
  name: string;
  phone?: string;
}

export interface SlotBooking {
  id: string;
  applicant: Applicant;
  createdAt: string; // ISO 8601
}

export const adminBookingsApi = {
  listBySlot: (slotId: string) =>
    adminClient.get<SlotBooking[]>(`/admin/slots/${slotId}/bookings`),
};
