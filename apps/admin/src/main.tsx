import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { initApiClient, setAdminTokenGetter } from "@biocom/api";
import { ToastProvider } from "@biocom/ui";
import { useAuthStore } from "./stores/authStore";
import "./index.css";
import App from "./App";

export function AuthListener() {
  const logout = useAuthStore((s) => s.logout);
  useEffect(() => {
    const handler = () => {
      logout();
      window.location.href = "/login";
    };
    window.addEventListener("auth:logout", handler);
    return () => window.removeEventListener("auth:logout", handler);
  }, [logout]);
  return null;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30 * 1000,
    },
  },
});

initApiClient(
  import.meta.env.DEV ? "/api" : (import.meta.env.VITE_API_BASE_URL || "http://localhost:8008"),
);
setAdminTokenGetter(() => useAuthStore.getState().token);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthListener />
        <App />
      </ToastProvider>
    </QueryClientProvider>
  </StrictMode>,
);
