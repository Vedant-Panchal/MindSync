import Landing from "@/pages/Landing";
import { useAuthStore } from "@/stores/authStore";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const user = useAuthStore((state) => state.user);

  return <Landing isLoggedIn={!!user} />;
}
