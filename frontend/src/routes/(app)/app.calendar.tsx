import JournalsPage from "@/components/ui/calender-component";
import SwipeCards from "@/components/ui/calender-component";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(app)/app/calendar")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="mb-3">
        <JournalsPage />
      </div>
    </div>
  );
}
