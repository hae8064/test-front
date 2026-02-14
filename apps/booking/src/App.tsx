import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ReservePage } from './pages/ReservePage';
import { CompletePage } from './pages/CompletePage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/public/reserve" element={<ReservePage />} />
        <Route path="/public/complete" element={<CompletePage />} />
        <Route path="*" element={<ReservePage />} />
      </Routes>
    </BrowserRouter>
  );
}
