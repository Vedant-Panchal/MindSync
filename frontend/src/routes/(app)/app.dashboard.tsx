import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(app)/app/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div></div>;
}
