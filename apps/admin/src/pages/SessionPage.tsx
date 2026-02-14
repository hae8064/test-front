import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import {
  adminSessionsApi,
  SessionOutcome,
  type Session,
} from "@biocom/api";
import { formatKST } from "@biocom/utils";
import { Button, useToast } from "@biocom/ui";

const OUTCOME_OPTIONS: { value: SessionOutcome; label: string }[] = [
  { value: SessionOutcome.COMPLETED, label: "완료" },
  { value: SessionOutcome.NO_SHOW, label: "노쇼" },
  { value: SessionOutcome.CANCELLED, label: "취소" },
  { value: SessionOutcome.FOLLOW_UP, label: "후속 상담" },
];

function getOutcomeLabel(value: string) {
  return OUTCOME_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export function SessionPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: session, isLoading, isError } = useQuery({
    queryKey: ["session", bookingId],
    queryFn: async (): Promise<Session | null> => {
      try {
        const res = await adminSessionsApi.get(bookingId!);
        return res.data;
      } catch (err) {
        if ((err as { response?: { status?: number } })?.response?.status === 404) {
          return null;
        }
        throw err;
      }
    },
    enabled: !!bookingId,
    retry: (_, err) => (err as { response?: { status?: number } })?.response?.status !== 404,
  });

  const saveMutation = useMutation({
    mutationFn: (data: { notes: string; outcome: SessionOutcome }) =>
      adminSessionsApi.save(bookingId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session", bookingId] });
      toast("저장되었습니다", "success");
    },
    onError: (e: Error & { response?: { data?: { message?: string } } }) => {
      toast(e.response?.data?.message ?? "저장 실패", "error");
    },
  });

  const hasExistingSession = session != null;
  const notesContent =
    session?.notes && typeof session.notes === "object" && "content" in session.notes
      ? String((session.notes as { content?: string }).content ?? "")
      : "";

  const { register, handleSubmit } = useForm<{
    notes: string;
    outcome: SessionOutcome;
  }>({
    defaultValues: {
      notes: notesContent,
      outcome: (session?.outcome as SessionOutcome) ?? SessionOutcome.COMPLETED,
    },
    values: hasExistingSession
      ? {
          notes: notesContent,
          outcome: (session?.outcome as SessionOutcome) ?? SessionOutcome.COMPLETED,
        }
      : undefined,
  });

  if (!bookingId) return <p>bookingId가 없습니다</p>;

  if (isLoading) {
    return (
      <div>
        <h2 className="mb-6 text-xl font-semibold">
          상담 기록 - 예약 #{bookingId.slice(0, 8)}
        </h2>
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        <h2 className="mb-6 text-xl font-semibold">
          상담 기록 - 예약 #{bookingId.slice(0, 8)}
        </h2>
        <p className="text-destructive">상담 기록을 불러올 수 없습니다.</p>
      </div>
    );
  }

  if (hasExistingSession) {
    return (
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            상담 기록 - 예약 #{bookingId.slice(0, 8)}
          </h2>
          <Link to="/bookings">
            <Button variant="outline" size="sm">
              목록으로
            </Button>
          </Link>
        </div>
        <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-4">
          <div>
            <p className="mb-1 text-sm text-muted-foreground">상담 결과</p>
            <p className="font-medium">{getOutcomeLabel(session.outcome)}</p>
          </div>
          {session.startedAt && (
            <div>
              <p className="mb-1 text-sm text-muted-foreground">상담 시작</p>
              <p>{formatKST(session.startedAt, "datetime")}</p>
            </div>
          )}
          {session.endedAt && (
            <div>
              <p className="mb-1 text-sm text-muted-foreground">상담 종료</p>
              <p>{formatKST(session.endedAt, "datetime")}</p>
            </div>
          )}
          <div>
            <p className="mb-1 text-sm text-muted-foreground">상담 기록</p>
            <p className="whitespace-pre-wrap">
              {notesContent || "기록 없음"}
            </p>
          </div>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          기존 상담 기록이 있어 추가 저장이 불가합니다.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold">
        상담 기록 - 예약 #{bookingId.slice(0, 8)}
      </h2>
      <form
        onSubmit={handleSubmit((d) => saveMutation.mutate(d))}
        className="flex flex-col gap-4"
      >
        <div>
          <label className="mb-2 block text-sm font-medium">상담 결과</label>
          <select
            {...register("outcome")}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {OUTCOME_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
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
