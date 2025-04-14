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
      <AppSidebar variant="floating" data={sidebardata} />
      <SidebarInset className="max-h-screen">
        <SiteHeader />
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
