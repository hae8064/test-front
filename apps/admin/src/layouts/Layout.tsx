import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Button } from '@biocom/ui';

const navItems = [
  { to: '/slots', label: '슬롯 관리' },
  { to: '/email-links', label: '예약 링크 생성' },
  { to: '/bookings', label: '예약자 조회' },
];

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-56 border-r border-border bg-muted/30">
        <div className="flex h-full flex-col p-4">
          <h1 className="mb-6 text-lg font-semibold">Admin</h1>
          <nav className="flex flex-1 flex-col gap-1">
            {navItems.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`rounded-md px-3 py-2 text-sm transition-colors ${
                  location.pathname === to
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            로그아웃
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <header className="border-b border-border px-6 py-4">
          <h2 className="text-lg font-medium">예약 관리 시스템</h2>
        </header>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
