import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(app)/app/journals")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/app/journals"!</div>;
}
