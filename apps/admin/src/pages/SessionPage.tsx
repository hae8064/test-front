import { useParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { adminSessionsApi } from "@biocom/api";
import { Button, useToast } from "@biocom/ui";

/** POST /admin/bookings/{bookingId}/session - 상담 기록 저장만 (GET 없음) */
export function SessionPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { toast } = useToast();

  const saveMutation = useMutation({
    mutationFn: (notes: string) =>
      adminSessionsApi.save(bookingId!, { notes }),
    onSuccess: () => toast("저장되었습니다", "success"),
    onError: (e: Error & { response?: { data?: { message?: string } } }) => {
      toast(e.response?.data?.message ?? "저장 실패", "error");
    },
  });

  const { register, handleSubmit } = useForm<{ notes: string }>({
    defaultValues: { notes: "" },
  });

  if (!bookingId) return <p>bookingId가 없습니다</p>;

  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold">
        상담 기록 - 예약 #{bookingId.slice(0, 8)}
      </h2>
      <form
        onSubmit={handleSubmit((d) => saveMutation.mutate(d.notes))}
        className="flex flex-col gap-4"
      >
        <div>
          <label className="mb-2 block text-sm font-medium">상담 기록</label>
          <textarea
            {...register("notes")}
            className="min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="상담 내용을 입력하세요..."
          />
        </div>
        <Button type="submit" disabled={saveMutation.isPending}>
          {saveMutation.isPending ? "저장 중..." : "저장"}
        </Button>
      </form>
    </div>
  );
}
