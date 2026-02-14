import { adminClient } from '../client';

export interface LoginRequest {
  email: string;
  password: string;
}

/** 201 응답: { access_token } */
export interface LoginResponse {
  access_token: string;
}

export const adminAuthApi = {
  login: (data: LoginRequest) =>
    adminClient.post<LoginResponse>('/auth/login', data),
};
