import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { initApiClient } from "@biocom/api";
import { ToastProvider } from "@biocom/ui";
import "./index.css";
import App from "./App";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30 * 1000,
    },
  },
});

initApiClient(
  import.meta.env.DEV
    ? "/api"
    : import.meta.env.VITE_API_BASE_URL || "http://localhost:8008",
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <App />
      </ToastProvider>
    </QueryClientProvider>
  </StrictMode>,
);
