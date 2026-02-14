import type { ReactNode } from 'react';

export interface TableProps {
  children: ReactNode;
  className?: string;
}

export function Table({ children, className = '' }: TableProps) {
  return (
    <div className={`w-full overflow-auto ${className}`}>
      <table className="w-full caption-bottom text-sm">
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children }: { children: ReactNode }) {
  return <thead>{children}</thead>;
}

export function TableBody({ children }: { children: ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function TableRow({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <tr
      className={`border-b transition-colors hover:bg-muted/50 ${className}`}
    >
      {children}
    </tr>
  );
}

export function TableHead({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`h-12 px-4 text-left align-middle font-medium text-muted-foreground ${className}`}
    >
      {children}
    </th>
  );
}

export function TableCell({
  children,
  className = '',
  colSpan,
}: {
  children: ReactNode;
  className?: string;
  colSpan?: number;
}) {
  return (
    <td colSpan={colSpan} className={`p-4 align-middle ${className}`}>
      {children}
    </td>
  );
}
