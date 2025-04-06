import { AuthLayout } from "@/components/layouts/auth-layout";
import { SignUpForm } from "@/features/auth/components/signup-form";

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/signup")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <AuthLayout title="Create an account">
      <SignUpForm />
    </AuthLayout>
  );
}
