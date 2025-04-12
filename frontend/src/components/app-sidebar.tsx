import * as React from "react";
import MindSyncLogo from "@/assets/logo.svg?react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <div className="flex h-max w-max items-end justify-start space-x-5">
          <MindSyncLogo className="fill-sidebar-foreground hover:fill-primary size-8 transition-colors duration-300" />
          <span className="inline-block text-2xl font-extrabold">MindSync</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={props.data.navMain} />
        {/* <NavDocuments items={props.data.documents} /> */}
        {/* <NavSecondary items={props.data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={props.data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
