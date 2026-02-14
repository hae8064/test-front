import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { adminAuthApi, type LoginResponse } from "@biocom/api";
import { useAuthStore } from "../stores/authStore";
import { Button, Input, useToast } from "@biocom/ui";

const schema = z.object({
  email: z.string().email("이메일 형식이 올바르지 않습니다"),
  password: z.string().min(1, "비밀번호를 입력하세요"),
});

type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { token, setAuth } = useAuthStore();

  useEffect(() => {
    if (token) navigate("/", { replace: true });
  }, [token, navigate]);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) =>
      adminAuthApi.login(data).then((r) => r.data),
    onSuccess: (data: LoginResponse) => {
      setAuth(data.access_token);
      toast("로그인 성공", "success");
      navigate("/");
    },
    onError: (err: Error & { response?: { data?: { message?: string } } }) => {
      toast(err.response?.data?.message ?? "로그인 실패", "error");
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30">
      <div className="w-full max-w-sm rounded-lg border bg-background p-6 shadow-sm">
        <h1 className="mb-6 text-xl font-semibold">관리자 로그인</h1>
        <form
          onSubmit={handleSubmit((d) => mutate(d))}
          className="flex flex-col gap-4"
        >
          <div>
            <label className="mb-2 block text-sm font-medium">이메일</label>
            <Input
              type="email"
              placeholder="admin@example.com"
              {...register("email")}
              error={!!errors.email}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">비밀번호</label>
            <Input
              type="password"
              placeholder="••••••••"
              {...register("password")}
              error={!!errors.password}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending ? "로그인 중..." : "로그인"}
          </Button>
        </form>
      </div>
    </div>
  );
}
