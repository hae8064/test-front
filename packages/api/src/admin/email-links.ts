import { adminClient } from '../client';

export interface EmailLink {
  token?: string;
  link?: string;  // API가 반환하는 전체 URL
  url?: string;
  expiresAt?: string;
}

export interface CreateEmailLinkRequest {
  counselorId?: string;
  expiresInHours?: number;
}

export const adminEmailLinksApi = {
  create: (data?: CreateEmailLinkRequest) =>
    adminClient.post<EmailLink>('/admin/email-links', data ?? {}),
};
