import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { publicReserveApi, type ReserveSlot } from "@biocom/api";
import { Button, Input, Calendar, useToast } from "@biocom/ui";

const CAPACITY = 3;

function parseTime(iso: string) {
  return iso.slice(11, 16);
}

const schema = z.object({
  email: z.string().email("이메일 형식이 올바르지 않습니다"),
  name: z.string().min(1, "이름을 입력하세요"),
  phone: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function ReservePage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { toast } = useToast();

  function getErrorMessage(e: unknown, fallback: string): string {
    const err = e as {
      response?: { data?: { message?: string; detail?: string } };
    };
    return (
      err?.response?.data?.message ??
      err?.response?.data?.detail ??
      (e instanceof Error ? e.message : fallback)
    );
  }

  const dateParam = searchParams.get("date");
  const effectiveDate = selectedDate ?? dateParam ?? undefined;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["public-reserve", token, effectiveDate],
    queryFn: () =>
      publicReserveApi.verify(token, effectiveDate).then((r) => r.data),
    enabled: !!token,
  });

  const slotsForDate = (() => {
    const slots = data?.slots ?? [];
    if (!effectiveDate) return slots;
    return slots.filter((s) => s.startAt.slice(0, 10) === effectiveDate);
  })();

  const reserveMutation = useMutation({
    mutationFn: (formData: FormData) =>
      publicReserveApi.reserve(token, {
        slotId: selectedSlotId!,
        email: formData.email,
        name: formData.name,
        phone: formData.phone,
      }),
    onSuccess: (res) => {
      setSubmitError(null);
      if (res.data.bookingId) {
        setBookingId(res.data.bookingId);
        toast("예약이 완료되었습니다", "success");
      } else {
        const msg = res.data.message ?? "예약 실패";
        setSubmitError(msg);
        toast(msg, "error");
      }
    },
    onError: (e: unknown) => {
      const msg = getErrorMessage(e, "예약에 실패했습니다.");
      setSubmitError(msg);
      toast(msg, "error");
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (formData: FormData) => {
    if (selectedSlotId) {
      setSubmitError(null);
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

  if (isError || (!isLoading && !data)) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="rounded-lg border bg-background p-6 text-center">
          <p className="text-destructive">
            예약 링크를 확인할 수 없습니다. (토큰 만료 또는 이미 사용됨)
          </p>
        </div>
      </div>
    );
  }

  if (bookingId) {
    const bookedSlot = slotsForDate.find((s) => s.id === selectedSlotId);
    const slotDate = bookedSlot?.startAt?.slice(0, 10) ?? "";
    const slotTime =
      bookedSlot != null
        ? `${bookedSlot.startAt.slice(11, 16)} ~ ${bookedSlot.endAt.slice(11, 16)}`
        : "";
    const completeParams = new URLSearchParams({ bookingId });
    if (slotDate) completeParams.set("slotDate", slotDate);
    if (slotTime) completeParams.set("slotTime", slotTime);

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
              (window.location.href = `/public/complete?${completeParams.toString()}`)
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
              value={selectedDate ?? dateParam ?? undefined}
              onChange={(d) => {
                setSelectedDate(d);
                setSelectedSlotId(null);
                setSubmitError(null);
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
                  {slotsForDate.map((slot: ReserveSlot) => {
                    const full =
                      (slot.bookedCount ?? 0) >= (slot.capacity ?? CAPACITY);
                    return (
                      <Button
                        key={slot.id}
                        variant={
                          selectedSlotId === slot.id ? "primary" : "outline"
                        }
                        disabled={full}
                        onClick={() => {
                          setSelectedSlotId(slot.id);
                          setSubmitError(null);
                        }}
                      >
                        {parseTime(slot.startAt)}~{parseTime(slot.endAt)}
                        {full ? " (마감)" : ""}
                      </Button>
                    );
                  })}
                  {slotsForDate.length === 0 && (
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
                    {...register("name")}
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
                    {...register("email")}
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
                  <Input {...register("phone")} placeholder="010-0000-0000" />
                </div>
                {submitError && (
                  <p className="rounded-md border border-destructive bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {submitError}
                  </p>
                )}
                <Button type="submit" disabled={reserveMutation.isPending}>
                  {reserveMutation.isPending ? "예약 중..." : "예약 신청"}
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
