import * as React from "react";
import MindSyncLogo from "@/assets/logo.svg?react";
import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
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
        <div className="flex items-end justify-start h-max w-max space-x-5">
          <MindSyncLogo className="size-8 fill-sidebar-foreground hover:fill-primary transition-colors duration-300" />
          <span className="text-2xl font-extrabold inline-block">MindSync</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={props.data.navMain} />
        {/* <NavDocuments items={props.data.documents} /> */}
        <NavSecondary items={props.data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={props.data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
