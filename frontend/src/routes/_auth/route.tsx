import { useAuthStore } from "@/stores/authStore";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth")({
  component: RouteComponent,
  loader: async () => {
    const user = useAuthStore.getState().user;
    if (user) {
      return redirect({ to: "/app/dashboard" });
    }
    return null;
  },
});

function RouteComponent() {
  return <Outlet />;
}
