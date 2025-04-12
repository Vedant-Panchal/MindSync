import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getUser, LoginInput, loginInputSchema, useLogin } from "@/lib/auth";
import { Spinner } from "@/components/ui/spinner";
import toast from "react-hot-toast";
import API_PATHS from "@/config/api-paths";
import MindSyncLogo from "@/assets/logo.svg?react";
import { useAuthStore } from "@/stores/authStore";
export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginInputSchema) });
  const navigate = useNavigate();
  const { isPending, mutate: login } = useLogin({
    onSuccess: async () => {
      toast.success("Login successful!");
      const user = await getUser();
      useAuthStore.getState().setUser(user);
      navigate({ to: "/app/dashboard" });
    },
    onError: (error: any) => {
      toast.error(error.detail);
    },
  });
  const handleGoogleLogin = async () => {
    window.location.href = `http://localhost:8000${API_PATHS.AUTH.GOOGLE_LOGIN}`;
  };
  const onSubmit = async (data: LoginInput) => {
    login(data);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden">
        <CardContent className="grid p-0">
          <form
            className="p-6 md:px-8 md:py-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="-mt-4 flex w-full items-center justify-center space-x-3">
              <MindSyncLogo className="size-5 fill-slate-900" />
              <div className="text-xl font-bold text-slate-900">MindSync</div>
            </div>
            <div className="mt-5 flex flex-col gap-6">
              <div className="flex flex-col items-start justify-start gap-1">
                <h1 className="text-xl font-bold text-gray-900 md:text-2xl dark:text-white">
                  Login
                </h1>
                <p className="text-sm">
                  Enter your email below to login to your account
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full cursor-pointer"
                disabled={isPending}
              >
                {isPending ? (
                  <Spinner className="stroke-accent md:size-5" />
                ) : (
                  "Continue"
                )}
              </Button>
              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-background text-muted-foreground relative z-10 px-2">
                  Or continue with
                </span>
              </div>
              <div className="flex">
                <Button
                  variant="outline"
                  className="w-full cursor-pointer"
                  onClick={handleGoogleLogin}
                  type="button"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="sr-only">Login with Google</span>
                </Button>
              </div>
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link
                  to="/signup"
                  className="cursor-pointer underline underline-offset-4"
                >
                  Sign up
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
