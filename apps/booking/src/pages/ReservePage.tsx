import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { publicReserveApi, type SlotInfo } from '@biocom/api';
import { Button, Input, Calendar, useToast } from '@biocom/ui';

const CAPACITY = 3;

const schema = z.object({
  email: z.string().email('이메일 형식이 올바르지 않습니다'),
  name: z.string().min(1, '이름을 입력하세요'),
  phone: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function ReservePage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const { toast } = useToast();

  const dateParam = searchParams.get('date');
  const effectiveDate = selectedDate ?? dateParam ?? undefined;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['public-reserve', token, effectiveDate],
    queryFn: () =>
      publicReserveApi.verify(token, effectiveDate).then((r) => r.data),
    enabled: !!token,
  });

  const reserveMutation = useMutation({
    mutationFn: (formData: FormData) =>
      publicReserveApi.reserve(token, {
        slotId: selectedSlotId!,
        email: formData.email,
        name: formData.name,
        phone: formData.phone,
      }),
    onSuccess: (res) => {
      if (res.data.success && res.data.bookingId) {
        setBookingId(res.data.bookingId);
        toast('예약이 완료되었습니다', 'success');
      } else {
        toast(res.data.message ?? '예약 실패', 'error');
      }
    },
    onError: (e: Error & { response?: { data?: { message?: string } } }) => {
      toast(e.response?.data?.message ?? '예약 실패', 'error');
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const slots: SlotInfo[] = data?.slots ?? [];
  const valid = data?.valid ?? false;

  const onSubmit = (formData: FormData) => {
    if (selectedSlotId) {
      reserveMutation.mutate(formData);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="rounded-lg border bg-background p-6 text-center">
          <p className="text-destructive">예약 링크가 올바르지 않습니다.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            이메일로 받은 링크를 확인해 주세요.
          </p>
        </div>
      </div>
    );
  }

  if (isError || (!isLoading && !valid)) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="rounded-lg border bg-background p-6 text-center">
          <p className="text-destructive">
            {data?.message ?? '예약 링크를 확인할 수 없습니다.'}
          </p>
        </div>
      </div>
    );
  }

  if (bookingId) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md rounded-lg border bg-background p-6 text-center">
          <h2 className="text-xl font-semibold text-green-600">예약 완료!</h2>
          <p className="mt-2 text-muted-foreground">
            예약이 성공적으로 완료되었습니다.
          </p>
          <Button
            className="mt-4"
            onClick={() =>
              (window.location.href = `/public/complete?bookingId=${bookingId}`)
            }
          >
            완료 화면으로
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 p-4">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-semibold">상담 예약</h1>

        <div className="space-y-6">
          <div>
            <h2 className="mb-3 font-medium">1. 날짜 선택</h2>
            <Calendar
              value={selectedDate ?? undefined}
              onChange={(d) => {
                setSelectedDate(d);
                setSelectedSlotId(null);
              }}
            />
          </div>

          {effectiveDate && (
            <div>
              <h2 className="mb-3 font-medium">2. 시간대 선택</h2>
              {isLoading ? (
                <p className="text-muted-foreground">로딩 중...</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {slots.map((slot) => {
                    const full =
                      (slot.currentCount ?? 0) >= (slot.capacity ?? CAPACITY);
                    return (
                      <Button
                        key={slot.id}
                        variant={
                          selectedSlotId === slot.id ? 'primary' : 'outline'
                        }
                        disabled={full}
                        onClick={() => setSelectedSlotId(slot.id)}
                      >
                        {slot.startTime}~{slot.endTime}
                        {full ? ' (마감)' : ''}
                      </Button>
                    );
                  })}
                  {slots.length === 0 && (
                    <p className="text-muted-foreground">
                      해당 날짜에 예약 가능한 슬롯이 없습니다.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {selectedSlotId && (
            <div>
              <h2 className="mb-3 font-medium">3. 예약자 정보</h2>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-4"
              >
                <div>
                  <label className="mb-2 block text-sm">이름 *</label>
                  <Input
                    {...register('name')}
                    placeholder="홍길동"
                    error={!!errors.name}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-destructive">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-2 block text-sm">이메일 *</label>
                  <Input
                    type="email"
                    {...register('email')}
                    placeholder="email@example.com"
                    error={!!errors.email}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-2 block text-sm">연락처</label>
                  <Input {...register('phone')} placeholder="010-0000-0000" />
                </div>
                <Button
                  type="submit"
                  disabled={reserveMutation.isPending}
                >
                  {reserveMutation.isPending ? '예약 중...' : '예약 신청'}
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
