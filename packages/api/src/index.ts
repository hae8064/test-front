export { publicClient, adminClient, setAdminTokenGetter, initApiClient } from './client';
export { adminAuthApi } from './admin/auth';
export { adminSlotsApi } from './admin/slots';
export { adminBookingsApi } from './admin/bookings';
export { adminEmailLinksApi } from './admin/email-links';
export { adminSessionsApi } from './admin/sessions';
export { publicReserveApi } from './public/reserve';

export type { LoginRequest, LoginResponse } from './admin/auth';
export type { Slot, CreateSlotRequest, UpdateSlotRequest } from './admin/slots';
export type { SlotBooking, Applicant } from './admin/bookings';
export type { EmailLink } from './admin/email-links';
export type {
  SlotInfo,
  ReserveVerifyResponse,
  ReserveRequest,
  ReserveResponse,
} from './public/reserve';
