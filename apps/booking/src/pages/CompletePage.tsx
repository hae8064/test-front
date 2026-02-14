import { useSearchParams } from 'react-router-dom';

function formatSlotDate(s: string) {
  const [y, m, d] = s.split('-');
  return y && m && d ? `${y}년 ${m}월 ${d}일` : s;
}

export function CompletePage() {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const slotDate = searchParams.get('slotDate');
  const slotTime = searchParams.get('slotTime');

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border border-green-200 bg-background p-8 text-center">
        <h1 className="text-2xl font-semibold text-green-600">
          예약이 완료되었습니다
        </h1>
        <p className="mt-4 text-muted-foreground">
          예약 번호: {bookingId ?? '-'}
        </p>
        {(slotDate || slotTime) && (
          <p className="mt-2 text-muted-foreground">
            상담 일정: {[slotDate && formatSlotDate(slotDate), slotTime]
              .filter(Boolean)
              .join(' ')}
          </p>
        )}
        <p className="mt-2 text-sm text-muted-foreground">
          상담 일정에 맞춰 참여해 주시기 바랍니다.
        </p>
      </div>
    </div>
  );
}
