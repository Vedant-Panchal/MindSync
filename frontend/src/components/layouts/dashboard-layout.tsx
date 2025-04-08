import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getSidebarData } from "@/pages/Dashboard/sidebardata";
import { useAuthStore } from "@/stores/authStore";
import { useAvatar } from "@/hooks/useAvatar";
import { Outlet } from "@tanstack/react-router";

export default function DashboardLayout() {
  const currentUser = useAuthStore((state) => state.user);
  const avatarSrc = useAvatar(currentUser?.username!);
  const user = {
    ...currentUser,
    avatar: avatarSrc,
  };
  const sidebardata = getSidebarData(user);
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" data={sidebardata} />
      <SidebarInset>
        <SiteHeader />
        {/* <div className="flex flex-1 flex-col bg-gray-600">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
              <DataTable data={data} />
            </div>
          </div>
        </div> */}
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
