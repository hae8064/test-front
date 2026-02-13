import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./stores/authStore";
import { LoginPage } from "./pages/LoginPage";
import { Layout } from "./layouts/Layout";
import { SlotsPage } from "./pages/SlotsPage";
import { EmailLinksPage } from "./pages/EmailLinksPage";
import { BookingsPage } from "./pages/BookingsPage";
import { SessionPage } from "./pages/SessionPage";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/slots" replace />} />
          <Route path="slots" element={<SlotsPage />} />
          <Route path="email-links" element={<EmailLinksPage />} />
          <Route path="bookings" element={<BookingsPage />} />
          <Route path="sessions/:bookingId" element={<SessionPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
