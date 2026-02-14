import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  adminSlotsApi,
  type Slot,
  type CreateSlotRequest,
  type UpdateSlotRequest,
} from "@biocom/api";
import {
  Button,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Calendar,
  useToast,
} from "@biocom/ui";

/** API 에러에서 메시지 추출 (Axios: response.data.message/detail, 기타: Error.message) */
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

/** 30분 단위 시간 옵션 08:00 ~ 18:30 */
const TIME_OPTIONS = Array.from({ length: 22 }, (_, i) => {
  const h = 8 + Math.floor(i / 2);
  const m = (i % 2) * 30;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
});

function parseStartAt(startAt: string) {
  const date = startAt.slice(0, 10);
  const time = startAt.slice(11, 16);
  return { date, time };
}

function parseEndAt(endAt: string) {
  return endAt.slice(11, 16);
}

/** date(YYYY-MM-DD) + time(HH:mm) -> API startAt 형식 "2026-02-17T09:00:00" */
function toStartAt(date: string, time: string): string {
  return `${date}T${time}:00`;
}

const slotSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "날짜를 선택하세요"),
  startTime: z.string().min(1, "시간을 선택하세요"),
});

type SlotFormData = z.infer<typeof slotSchema>;

export function SlotsPage() {
  const [dateFilter, setDateFilter] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<Slot | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: allSlots = [], isLoading } = useQuery({
    queryKey: ["slots"],
    queryFn: () =>
      adminSlotsApi.list({ includeBookings: true }).then((r) => r.data),
  });

  const slots = useMemo(() => {
    if (!Array.isArray(allSlots)) return [];
    return allSlots.filter((s) => {
      const { date } = parseStartAt(s.startAt);
      return date === dateFilter;
    });
  }, [allSlots, dateFilter]);

  const createMutation = useMutation({
    mutationFn: async (data: CreateSlotRequest) => {
      const res = await adminSlotsApi.create(data);
      const d = res.data as { slot?: Slot; message?: string };
      if (!d?.slot) {
        throw new Error(d?.message ?? "슬롯 생성에 실패했습니다.");
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slots"] });
      setSubmitError(null);
      toast("슬롯 생성 완료", "success");
      setModalOpen(false);
      reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSlotRequest }) =>
      adminSlotsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slots"] });
      setSubmitError(null);
      toast("수정 완료", "success");
      setModalOpen(false);
      setEditingSlot(null);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminSlotsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slots"] });
      toast("삭제 완료", "success");
    },
    onError: (e: unknown) => {
      toast(getErrorMessage(e, "슬롯 삭제에 실패했습니다."), "error");
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SlotFormData>({
    resolver: zodResolver(slotSchema),
    defaultValues: {
      date: dateFilter,
      startTime: "09:00",
    },
  });

  const watchDate = watch("date");

  const onSubmit = async (d: SlotFormData) => {
    const startAt = toStartAt(d.date, d.startTime);
    try {
      if (editingSlot) {
        await updateMutation.mutateAsync({
          id: editingSlot.id,
          data: { startAt, status: "OPEN" },
        });
      } else {
        await createMutation.mutateAsync({ startAt, status: "OPEN" });
      }
    } catch (e) {
      const msg = getErrorMessage(e, "작업에 실패했습니다.");
      setSubmitError(msg);
      toast(msg, "error");
    }
  };

  const openCreateModal = () => {
    setModalOpen(true);
    setEditingSlot(null);
    setSubmitError(null);
    setTimeout(() => {
      reset({
        date: dateFilter,
        startTime: "09:00",
      });
    }, 0);
  };

  const openEditModal = (slot: Slot) => {
    setEditingSlot(slot);
    setSubmitError(null);
    const { date, time } = parseStartAt(slot.startAt);
    reset({ date, startTime: time });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingSlot(null);
    setSubmitError(null);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">슬롯 관리</h2>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          + 새 슬롯 추가
        </button>
      </div>

      <div className="mb-6 flex gap-4">
        <div>
          <label className="mb-1 block text-sm">날짜 선택</label>
          <Calendar
            value={dateFilter}
            onChange={setDateFilter}
            minDate={undefined}
            maxDate={undefined}
          />
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">로딩 중...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">날짜</TableHead>
              <TableHead className="text-center">시간</TableHead>
              <TableHead className="text-center">정원</TableHead>
              <TableHead className="text-center">인원</TableHead>
              <TableHead> </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {slots.map((s) => {
              const { date, time } = parseStartAt(s.startAt);
              const endStr = parseEndAt(s.endAt);
              return (
                <TableRow key={s.id}>
                  <TableCell className="text-center">{date}</TableCell>
                  <TableCell className="text-center">
                    {time} ~ {endStr}
                  </TableCell>
                  <TableCell className="text-center">{s.capacity}명</TableCell>
                  <TableCell className="text-center">
                    {s.bookedCount}/{s.capacity}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(s)}
                      >
                        수정
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (confirm("삭제하시겠습니까?"))
                            deleteMutation.mutate(s.id);
                        }}
                      >
                        삭제
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {modalOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          onClick={closeModal}
        >
          <div
            className="z-10 w-full max-w-lg rounded-lg border border-border bg-background p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-4 text-lg font-semibold">
              {editingSlot ? "슬롯 수정" : "슬롯 추가"}
            </h2>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <div>
                <label className="mb-2 block text-sm font-medium">
                  날짜 선택
                </label>
                <Calendar
                  value={watchDate || dateFilter}
                  onChange={(d) =>
                    setValue("date", d, { shouldValidate: true })
                  }
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.date.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  시작 시간 (30분 단위)
                </label>
                <select
                  {...register("startTime")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {TIME_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                {errors.startTime && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.startTime.message}
                  </p>
                )}
              </div>

              {submitError && (
                <p className="rounded-md border border-destructive bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {submitError}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={closeModal}>
                  취소
                </Button>
                <Button
                  type="submit"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "처리 중..."
                    : editingSlot
                      ? "수정"
                      : "추가"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
