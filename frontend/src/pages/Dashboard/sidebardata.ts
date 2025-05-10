import { Route as dashboardRoute } from "@/routes/(app)/app.dashboard";
import { Route as journalRoute } from "@/routes/(app)/app.journals";
import { Route as calendarRoute } from "@/routes/(app)/app.calendar";
import { Route as chatRoute } from "@/routes/(app)/app.chat";

import {
  IconBulb,
  IconCalendarWeek,
  IconCategory,
  IconChartBar,
  IconMessageChatbot,
} from "@tabler/icons-react";
import { SquarePen } from "lucide-react";

export const getSidebarData = (user: any) => {
  return {
    user: {
      name: user?.username || "Guest",
      email: user?.email || "guest@example.com",
      avatar: user?.avatar || "Test User",
    },
    navMain: [
      { title: "Dashboard", url: dashboardRoute, icon: IconCategory },
      { title: "Journals", url: journalRoute, icon: SquarePen },
      { title: "Calendar", url: calendarRoute, icon: IconCalendarWeek },
      { title: "Chat", url: chatRoute, icon: IconMessageChatbot },
    ],
    // navSecondary: [
    //   {
    //     title: "Settings",
    //     url: settingsRoute,
    //     icon: IconSettings,
    //   },
    // ],
    // documents: [
    //     {
    //         name: "Data Library",
    //         url: "#",
    //         icon: IconDatabase,
    //     },
    //     {
    //         name: "Reports",
    //         url: "#",
    //         icon: IconReport,
    //     },
    //     {
    //         name: "Word Assistant",
    //         url: "#",
    //         icon: IconFileWord,
    //     },
    // ],
  };
};
