"use client";

import * as React from "react";
import { type Icon } from "@tabler/icons-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Route, useLocation, useNavigate } from "@tanstack/react-router";

export function NavSecondary({
  items,
  ...props
}: {
  items: {
    title: string;
    url: Route;
    icon?: Icon;
  }[];
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const navigate = useNavigate({ from: "/app" });
  const { pathname } = useLocation();
  console.log(pathname);
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = pathname === item.url.to;
            return (
              <SidebarMenuItem
                key={item.title}
                onClick={() => navigate({ to: item.url.to })}
              >
                <SidebarMenuButton data-active={isActive}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
