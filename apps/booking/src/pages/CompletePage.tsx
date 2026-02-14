import { useSearchParams } from 'react-router-dom';

export function CompletePage() {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId');

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border bg-background p-8 text-center">
        <h1 className="text-2xl font-semibold text-green-600">
          예약이 완료되었습니다
        </h1>
        <p className="mt-4 text-muted-foreground">
          예약 번호: {bookingId ?? '-'}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          상담 일정에 맞춰 참여해 주시기 바랍니다.
        </p>
      </div>
    </div>
  );
}
