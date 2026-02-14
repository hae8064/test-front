export {
  publicClient,
  adminClient,
  setAdminTokenGetter,
  initApiClient,
} from "./client";
export { adminAuthApi } from "./admin/auth";
export { adminSlotsApi } from "./admin/slots";
export { adminBookingsApi } from "./admin/bookings";
export { adminEmailLinksApi } from "./admin/email-links";
export { adminSessionsApi, SessionOutcome } from "./admin/sessions";
export { publicReserveApi } from "./public/reserve";

export type { LoginRequest, LoginResponse } from "./admin/auth";
export type { Slot, CreateSlotRequest, UpdateSlotRequest } from "./admin/slots";
export type { SlotBooking, Applicant } from "./admin/bookings";
export type { EmailLink, CreateEmailLinkRequest } from "./admin/email-links";
export type { SaveSessionRequest, Session } from "./admin/sessions";
export type {
  ReserveSlot,
  ReserveVerifyResponse,
  ReserveRequest,
  ReserveResponse,
} from "./public/reserve";
