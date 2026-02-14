import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface ToastMessage {
  id: number;
  message: string;
  type?: 'success' | 'error' | 'info';
}

interface ToastContextValue {
  toast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 0;
export function ToastProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const toast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = ++nextId;
    setMessages((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setMessages((prev) => prev.filter((m) => m.id !== id));
    }, 3000);
  }, []);

  const toastContainer = (
    <div
      className="fixed bottom-4 right-4 flex flex-col gap-2"
      style={{ zIndex: 2147483647 }}
    >
      {messages.map((m) => (
        <div
          key={m.id}
          className={`
            rounded-lg border px-4 py-2 shadow-lg
            ${m.type === 'error' ? 'border-destructive bg-destructive/10 text-destructive' : ''}
            ${m.type === 'success' ? 'border-green-500 bg-green-500/10 text-green-700 dark:text-green-400' : ''}
            ${m.type === 'info' || !m.type ? 'border-border bg-background' : ''}
          `}
        >
          {m.message}
        </div>
      ))}
    </div>
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {typeof document !== 'undefined' && createPortal(toastContainer, document.body)}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
