import { Route as dashboardRoute } from "@/routes/(app)/app.dashboard";
import { Route as journalRoute } from "@/routes/(app)/app.journals";
import { Route as insightsRoute } from "@/routes/(app)/app.insights";
import { Route as moodsRoute } from "@/routes/(app)/app.moods";
import { Route as calendarRoute } from "@/routes/(app)/app.calendar";
import { Route as settingsRoute } from "@/routes/(app)/app.settings";

import {
    IconChartBar,
    IconDashboard,
    IconFolder,
    IconListDetails,
    IconSettings,
    IconUsers,
} from "@tabler/icons-react";

export const getSidebarData = (user: any) => {

    return {
        user: {
            name: user?.username || "Guest",
            email: user?.email || "guest@example.com",
            avatar: user?.avatar || "Test User",
        },
        navMain: [
            {
                title: "Dashboard",
                url: dashboardRoute,
                icon: IconDashboard,
            },
            {
                title: "Journals",
                url: journalRoute,
                icon: IconListDetails,
            },
            {
                title: "Insights",
                url: insightsRoute,
                icon: IconChartBar,
            },
            {
                title: "Moods",
                url: moodsRoute,
                icon: IconFolder,
            },
            {
                title: "Calendar",
                url: calendarRoute,
                icon: IconUsers,
            },
        ],
        navSecondary: [
            {
                title: "Settings",
                url: settingsRoute,
                icon: IconSettings,
            },
        ],
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