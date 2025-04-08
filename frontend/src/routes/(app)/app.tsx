import DashboardLayout from "@/components/layouts/dashboard-layout";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(app)/app")({
  component: RouteComponent,
});

function RouteComponent() {
  return <DashboardLayout />;
}
