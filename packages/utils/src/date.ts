const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/**
 * UTC Date/ISO string -> KST 기준 포맷
 * @param input - Date, ISO string, 또는 timestamp
 * @param format - 'date' | 'datetime' | 'time' | 'date-ko'
 */
export function formatKST(
  input: Date | string | number,
  format: 'date' | 'datetime' | 'time' | 'date-ko' = 'datetime'
): string {
  const d = typeof input === 'string' || typeof input === 'number'
    ? new Date(input)
    : input;
  const kst = new Date(d.getTime() + KST_OFFSET_MS);

  const y = kst.getUTCFullYear();
  const m = String(kst.getUTCMonth() + 1).padStart(2, '0');
  const day = String(kst.getUTCDate()).padStart(2, '0');
  const h = String(kst.getUTCHours()).padStart(2, '0');
  const min = String(kst.getUTCMinutes()).padStart(2, '0');
  const s = String(kst.getUTCSeconds()).padStart(2, '0');

  switch (format) {
    case 'date':
      return `${y}-${m}-${day}`;
    case 'time':
      return `${h}:${min}:${s}`;
    case 'date-ko':
      return `${y}년 ${m}월 ${day}일`;
    case 'datetime':
    default:
      return `${y}-${m}-${day} ${h}:${min}:${s} KST`;
  }
}

/** YYYY-MM-DD 형식인지 검사 */
export function isValidDateString(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}
