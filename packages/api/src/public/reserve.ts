import { publicClient } from "../client";

/** GET /public/reserve 응답의 슬롯 - startAt, endAt(ISO), bookedCount */
export interface ReserveSlot {
  id: string;
  counselorId: string;
  startAt: string;
  endAt: string;
  capacity: number;
  bookedCount: number;
  status: string;
}

/** GET /public/reserve 200 응답 */
export interface ReserveVerifyResponse {
  counselor: { id: string };
  slots: ReserveSlot[];
}

export interface ReserveRequest {
  slotId: string;
  email: string;
  name: string;
  phone?: string;
}

/** POST /public/bookings 201 응답 */
export interface ReserveResponse {
  message?: string;
  bookingId?: string;
}

/** GET /public/reserve - token 필수, date 생략 시 모든 미래 슬롯 */
export const publicReserveApi = {
  verify: (token: string, date?: string) =>
    publicClient.get<ReserveVerifyResponse>("/public/reserve", {
      params: { token, date },
    }),

  /** POST /public/bookings - body: { token, slotId, email, name, phone? } */
  reserve: (token: string, data: ReserveRequest) =>
    publicClient.post<ReserveResponse>("/public/bookings", {
      token,
      ...data,
    }),
};
