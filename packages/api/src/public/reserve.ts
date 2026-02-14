import { publicClient } from '../client';

export interface SlotInfo {
  id: string;
  startTime: string;
  endTime: string;
  capacity: number;
  currentCount: number;
  available: boolean;
}

export interface ReserveVerifyResponse {
  valid: boolean;
  slots?: SlotInfo[];
  message?: string;
}

export interface ReserveRequest {
  slotId: string;
  email: string;
  name: string;
  phone?: string;
}

export interface ReserveResponse {
  success?: boolean;
  bookingId?: string;
  message?: string;
}

/** GET /public/reserve - token 검증, date 시 슬롯 목록 */
export const publicReserveApi = {
  verify: (token: string, date?: string) =>
    publicClient.get<ReserveVerifyResponse>('/public/reserve', {
      params: { token, date },
    }),

  /** POST /public/bookings - 예약 생성 (token은 body 또는 query) */
  reserve: (token: string, data: ReserveRequest) =>
    publicClient.post<ReserveResponse>('/public/bookings', {
      token,
      ...data,
    }),
};
