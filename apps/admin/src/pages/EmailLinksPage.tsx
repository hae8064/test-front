import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { adminEmailLinksApi } from "@biocom/api";
import { Button, useToast } from "@biocom/ui";

export function EmailLinksPage() {
  const [link, setLink] = useState<string | null>(null);
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: () => adminEmailLinksApi.create(),
    onSuccess: (res) => {
      const url =
        res.data.link ||
        res.data.url ||
        (res.data.token
          ? `${window.location.origin}/public/reserve?token=${res.data.token}`
          : null);
      setLink(url || null);
      toast("링크 생성 완료", "success");
    },
    onError: (e: Error & { response?: { data?: { message?: string } } }) => {
      toast(e.response?.data?.message ?? "생성 실패", "error");
    },
  });

  const copyToClipboard = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      toast("클립보드에 복사되었습니다", "success");
    } catch {
      toast("복사 실패", "error");
    }
  };

  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold">예약 링크 생성</h2>
      <div className="flex flex-col gap-4">
        <Button
          onClick={() => createMutation.mutate()}
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? "생성 중..." : "새 링크 생성"}
        </Button>

        {link && (
          <div className="rounded-lg border p-4">
            <p className="mb-2 text-sm text-muted-foreground">예약 링크</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 truncate rounded bg-muted px-2 py-1 text-sm">
                {link}
              </code>
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                복사
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
