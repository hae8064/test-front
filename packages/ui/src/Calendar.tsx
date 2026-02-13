import 'react-day-picker/style.css';
import { DayPicker } from 'react-day-picker';

export interface CalendarProps {
  value?: string; // YYYY-MM-DD
  onChange?: (date: string) => void;
  minDate?: string;
  maxDate?: string;
}

function toDate(s: string | undefined): Date | undefined {
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return undefined;
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function toYYYYMMDD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function Calendar({
  value,
  onChange,
  minDate,
  maxDate,
}: CalendarProps) {
  const selected = toDate(value);

  return (
    <DayPicker
      mode="single"
      selected={selected}
      onSelect={(date) => date && onChange?.(toYYYYMMDD(date))}
      disabled={
        minDate || maxDate
          ? (date) => {
              const str = toYYYYMMDD(date);
              if (minDate && str < minDate) return true;
              if (maxDate && str > maxDate) return true;
              return false;
            }
          : undefined
      }
      className="rdp"
    />
  );
}
