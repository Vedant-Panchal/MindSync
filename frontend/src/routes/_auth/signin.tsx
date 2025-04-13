import { AuthLayout } from "@/components/layouts/auth-layout";
import { LoginForm } from "@/features/auth/components/login-form";
import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { z } from "zod";

export const Route = createFileRoute("/_auth/signin")({
  component: RouteComponent,
  validateSearch: z.object({
    status: z.enum(["error"]).optional(),
    message: z.string().optional(),
  }),
});

function RouteComponent() {
  const search = useSearch({ from: "/_auth/signin" });

  useEffect(() => {
    if (search.status === "error") {
      toast.error(decodeURIComponent(search.message || "OAuth login failed"));
    }
  }, [search.status, search.message]);

  return (
    <AuthLayout title="Welcome back!">
      <LoginForm />
    </AuthLayout>
  );
}
