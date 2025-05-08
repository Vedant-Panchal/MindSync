import JournalsPage from "@/components/ui/calender-component";
import SwipeCards from "@/components/ui/calender-component";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(app)/app/calendar")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex-1 overflow-auto bg-white sm:p-4">
      <JournalsPage />
    </div>
  );
}
