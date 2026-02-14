import axios from "axios";

let baseURL = "http://localhost:8008";

/** 앱에서 초기화 시 호출 (VITE_API_BASE_URL 전달) */
export function initApiClient(apiBaseUrl: string) {
  baseURL = apiBaseUrl || baseURL;
  publicClient.defaults.baseURL = baseURL;
  adminClient.defaults.baseURL = baseURL;
}

/** 공개 API용 axios instance (토큰 없음) */
export const publicClient = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

/** Admin API용 axios instance (JWT interceptor 적용) */
export const adminClient = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

/** 토큰 getter를 외부에서 주입 (Zustand 등) */
let tokenGetter: (() => string | null) | null = null;

export function setAdminTokenGetter(getter: () => string | null) {
  tokenGetter = getter;
}

adminClient.interceptors.request.use((config) => {
  const token = tokenGetter?.() ?? localStorage.getItem("admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

adminClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("admin_token");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth:logout"));
      }
    }
    return Promise.reject(err);
  },
);
