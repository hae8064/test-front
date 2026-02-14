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
  Input,
  Modal,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Calendar,
  useToast,
} from "@biocom/ui";

/** ISO 8601 "2026-02-11T09:00:00+09:00" 파싱 -> { date, time } */
function parseStartAt(startAt: string) {
  const date = startAt.slice(0, 10);
  const time = startAt.slice(11, 16);
  return { date, time };
}

function parseEndAt(endAt: string) {
  return endAt.slice(11, 16);
}

/** date + time -> ISO startAt (KST 09:00 = 2025-02-15T09:00:00+09:00) */
function toStartAt(date: string, time: string): string {
  return `${date}T${time}:00+09:00`;
}

const slotSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD 형식"),
  startTime: z.string().min(1),
});

type SlotFormData = z.infer<typeof slotSchema>;

export function SlotsPage() {
  const [dateFilter, setDateFilter] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<Slot | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: allSlots = [], isLoading } = useQuery({
    queryKey: ["slots"],
    queryFn: () =>
      adminSlotsApi.list({ includeBookings: true }).then((r) => r.data),
  });

  const slots = useMemo(() => {
    return allSlots.filter((s) => {
      const { date } = parseStartAt(s.startAt);
      return date === dateFilter;
    });
  }, [allSlots, dateFilter]);

  const createMutation = useMutation({
    mutationFn: (data: CreateSlotRequest) => adminSlotsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slots"] });
      toast("슬롯 생성 완료", "success");
      setModalOpen(false);
      reset();
    },
    onError: (e: Error & { response?: { data?: { message?: string } } }) => {
      toast(e.response?.data?.message ?? "생성 실패", "error");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateSlotRequest;
    }) => adminSlotsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slots"] });
      toast("수정 완료", "success");
      setModalOpen(false);
      setEditingSlot(null);
      reset();
    },
    onError: (e: Error & { response?: { data?: { message?: string } } }) => {
      toast(e.response?.data?.message ?? "수정 실패", "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminSlotsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slots"] });
      toast("삭제 완료", "success");
    },
    onError: (e: Error & { response?: { data?: { message?: string } } }) => {
      toast(e.response?.data?.message ?? "삭제 실패", "error");
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

  const onSubmit = (d: SlotFormData) => {
    if (editingSlot) {
      const startAt = toStartAt(d.date, d.startTime);
      updateMutation.mutate({
        id: editingSlot.id,
        data: { startAt, status: "OPEN" },
      });
    } else {
      const startAt = toStartAt(d.date, d.startTime);
      createMutation.mutate({ startAt, status: "OPEN" });
    }
  };

  const openCreateModal = () => {
    setEditingSlot(null);
    reset({
      date: dateFilter,
      startTime: "09:00",
    });
    setModalOpen(true);
  };

  const openEditModal = (slot: Slot) => {
    setEditingSlot(slot);
    const { date, time } = parseStartAt(slot.startAt);
    setValue("date", date);
    setValue("startTime", time);
    setModalOpen(true);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">슬롯 관리</h2>
        <Button onClick={openCreateModal}>새 슬롯 추가</Button>
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

      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingSlot(null);
        }}
        title={editingSlot ? "슬롯 수정" : "슬롯 추가"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <label className="mb-2 block text-sm">날짜</label>
            <Calendar
              value={watchDate || dateFilter}
              onChange={(d) => setValue("date", d)}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm">시작 시간</label>
            <Input
              type="time"
              {...register("startTime")}
              error={!!errors.startTime}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {editingSlot ? "수정" : "추가"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
