/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from "./routes/__root";
import { Route as AuthRouteImport } from "./routes/_auth/route";
import { Route as IndexImport } from "./routes/index";
import { Route as AuthSignupImport } from "./routes/_auth/signup";
import { Route as AuthSigninImport } from "./routes/_auth/signin";
import { Route as appAppImport } from "./routes/(app)/app";
import { Route as appAppJournalsImport } from "./routes/(app)/app.journals";
import { Route as appAppDashboardImport } from "./routes/(app)/app.dashboard";
import { Route as appAppCreateImport } from "./routes/(app)/app.create";
import { Route as appAppChatImport } from "./routes/(app)/app.chat";
import { Route as appAppCalendarImport } from "./routes/(app)/app.calendar";

// Create/Update Routes

const AuthRouteRoute = AuthRouteImport.update({
  id: "/_auth",
  getParentRoute: () => rootRoute,
} as any);

const IndexRoute = IndexImport.update({
  id: "/",
  path: "/",
  getParentRoute: () => rootRoute,
} as any);

const AuthSignupRoute = AuthSignupImport.update({
  id: "/signup",
  path: "/signup",
  getParentRoute: () => AuthRouteRoute,
} as any);

const AuthSigninRoute = AuthSigninImport.update({
  id: "/signin",
  path: "/signin",
  getParentRoute: () => AuthRouteRoute,
} as any);

const appAppRoute = appAppImport.update({
  id: "/(app)/app",
  path: "/app",
  getParentRoute: () => rootRoute,
} as any);

const appAppJournalsRoute = appAppJournalsImport.update({
  id: "/journals",
  path: "/journals",
  getParentRoute: () => appAppRoute,
} as any);

const appAppDashboardRoute = appAppDashboardImport.update({
  id: "/dashboard",
  path: "/dashboard",
  getParentRoute: () => appAppRoute,
} as any);

const appAppCreateRoute = appAppCreateImport.update({
  id: "/create",
  path: "/create",
  getParentRoute: () => appAppRoute,
} as any);

const appAppChatRoute = appAppChatImport.update({
  id: "/chat",
  path: "/chat",
  getParentRoute: () => appAppRoute,
} as any);

const appAppCalendarRoute = appAppCalendarImport.update({
  id: "/calendar",
  path: "/calendar",
  getParentRoute: () => appAppRoute,
} as any);

// Populate the FileRoutesByPath interface

declare module "@tanstack/react-router" {
  interface FileRoutesByPath {
    "/": {
      id: "/";
      path: "/";
      fullPath: "/";
      preLoaderRoute: typeof IndexImport;
      parentRoute: typeof rootRoute;
    };
    "/_auth": {
      id: "/_auth";
      path: "";
      fullPath: "";
      preLoaderRoute: typeof AuthRouteImport;
      parentRoute: typeof rootRoute;
    };
    "/(app)/app": {
      id: "/(app)/app";
      path: "/app";
      fullPath: "/app";
      preLoaderRoute: typeof appAppImport;
      parentRoute: typeof rootRoute;
    };
    "/_auth/signin": {
      id: "/_auth/signin";
      path: "/signin";
      fullPath: "/signin";
      preLoaderRoute: typeof AuthSigninImport;
      parentRoute: typeof AuthRouteImport;
    };
    "/_auth/signup": {
      id: "/_auth/signup";
      path: "/signup";
      fullPath: "/signup";
      preLoaderRoute: typeof AuthSignupImport;
      parentRoute: typeof AuthRouteImport;
    };
    "/(app)/app/calendar": {
      id: "/(app)/app/calendar";
      path: "/calendar";
      fullPath: "/app/calendar";
      preLoaderRoute: typeof appAppCalendarImport;
      parentRoute: typeof appAppImport;
    };
    "/(app)/app/chat": {
      id: "/(app)/app/chat";
      path: "/chat";
      fullPath: "/app/chat";
      preLoaderRoute: typeof appAppChatImport;
      parentRoute: typeof appAppImport;
    };
    "/(app)/app/create": {
      id: "/(app)/app/create";
      path: "/create";
      fullPath: "/app/create";
      preLoaderRoute: typeof appAppCreateImport;
      parentRoute: typeof appAppImport;
    };
    "/(app)/app/dashboard": {
      id: "/(app)/app/dashboard";
      path: "/dashboard";
      fullPath: "/app/dashboard";
      preLoaderRoute: typeof appAppDashboardImport;
      parentRoute: typeof appAppImport;
    };
    "/(app)/app/journals": {
      id: "/(app)/app/journals";
      path: "/journals";
      fullPath: "/app/journals";
      preLoaderRoute: typeof appAppJournalsImport;
      parentRoute: typeof appAppImport;
    };
  }
}

// Create and export the route tree

interface AuthRouteRouteChildren {
  AuthSigninRoute: typeof AuthSigninRoute;
  AuthSignupRoute: typeof AuthSignupRoute;
}

const AuthRouteRouteChildren: AuthRouteRouteChildren = {
  AuthSigninRoute: AuthSigninRoute,
  AuthSignupRoute: AuthSignupRoute,
};

const AuthRouteRouteWithChildren = AuthRouteRoute._addFileChildren(
  AuthRouteRouteChildren,
);

interface appAppRouteChildren {
  appAppCalendarRoute: typeof appAppCalendarRoute;
  appAppChatRoute: typeof appAppChatRoute;
  appAppCreateRoute: typeof appAppCreateRoute;
  appAppDashboardRoute: typeof appAppDashboardRoute;
  appAppJournalsRoute: typeof appAppJournalsRoute;
}

const appAppRouteChildren: appAppRouteChildren = {
  appAppCalendarRoute: appAppCalendarRoute,
  appAppChatRoute: appAppChatRoute,
  appAppCreateRoute: appAppCreateRoute,
  appAppDashboardRoute: appAppDashboardRoute,
  appAppJournalsRoute: appAppJournalsRoute,
};

const appAppRouteWithChildren =
  appAppRoute._addFileChildren(appAppRouteChildren);

export interface FileRoutesByFullPath {
  "/": typeof IndexRoute;
  "": typeof AuthRouteRouteWithChildren;
  "/app": typeof appAppRouteWithChildren;
  "/signin": typeof AuthSigninRoute;
  "/signup": typeof AuthSignupRoute;
  "/app/calendar": typeof appAppCalendarRoute;
  "/app/chat": typeof appAppChatRoute;
  "/app/create": typeof appAppCreateRoute;
  "/app/dashboard": typeof appAppDashboardRoute;
  "/app/journals": typeof appAppJournalsRoute;
}

export interface FileRoutesByTo {
  "/": typeof IndexRoute;
  "": typeof AuthRouteRouteWithChildren;
  "/app": typeof appAppRouteWithChildren;
  "/signin": typeof AuthSigninRoute;
  "/signup": typeof AuthSignupRoute;
  "/app/calendar": typeof appAppCalendarRoute;
  "/app/chat": typeof appAppChatRoute;
  "/app/create": typeof appAppCreateRoute;
  "/app/dashboard": typeof appAppDashboardRoute;
  "/app/journals": typeof appAppJournalsRoute;
}

export interface FileRoutesById {
  __root__: typeof rootRoute;
  "/": typeof IndexRoute;
  "/_auth": typeof AuthRouteRouteWithChildren;
  "/(app)/app": typeof appAppRouteWithChildren;
  "/_auth/signin": typeof AuthSigninRoute;
  "/_auth/signup": typeof AuthSignupRoute;
  "/(app)/app/calendar": typeof appAppCalendarRoute;
  "/(app)/app/chat": typeof appAppChatRoute;
  "/(app)/app/create": typeof appAppCreateRoute;
  "/(app)/app/dashboard": typeof appAppDashboardRoute;
  "/(app)/app/journals": typeof appAppJournalsRoute;
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath;
  fullPaths:
    | "/"
    | ""
    | "/app"
    | "/signin"
    | "/signup"
    | "/app/calendar"
    | "/app/chat"
    | "/app/create"
    | "/app/dashboard"
    | "/app/journals";
  fileRoutesByTo: FileRoutesByTo;
  to:
    | "/"
    | ""
    | "/app"
    | "/signin"
    | "/signup"
    | "/app/calendar"
    | "/app/chat"
    | "/app/create"
    | "/app/dashboard"
    | "/app/journals";
  id:
    | "__root__"
    | "/"
    | "/_auth"
    | "/(app)/app"
    | "/_auth/signin"
    | "/_auth/signup"
    | "/(app)/app/calendar"
    | "/(app)/app/chat"
    | "/(app)/app/create"
    | "/(app)/app/dashboard"
    | "/(app)/app/journals";
  fileRoutesById: FileRoutesById;
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute;
  AuthRouteRoute: typeof AuthRouteRouteWithChildren;
  appAppRoute: typeof appAppRouteWithChildren;
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  AuthRouteRoute: AuthRouteRouteWithChildren,
  appAppRoute: appAppRouteWithChildren,
};

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>();

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/_auth",
        "/(app)/app"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/_auth": {
      "filePath": "_auth/route.tsx",
      "children": [
        "/_auth/signin",
        "/_auth/signup"
      ]
    },
    "/(app)/app": {
      "filePath": "(app)/app.tsx",
      "children": [
        "/(app)/app/calendar",
        "/(app)/app/chat",
        "/(app)/app/create",
        "/(app)/app/dashboard",
        "/(app)/app/journals"
      ]
    },
    "/_auth/signin": {
      "filePath": "_auth/signin.tsx",
      "parent": "/_auth"
    },
    "/_auth/signup": {
      "filePath": "_auth/signup.tsx",
      "parent": "/_auth"
    },
    "/(app)/app/calendar": {
      "filePath": "(app)/app.calendar.tsx",
      "parent": "/(app)/app"
    },
    "/(app)/app/chat": {
      "filePath": "(app)/app.chat.tsx",
      "parent": "/(app)/app"
    },
    "/(app)/app/create": {
      "filePath": "(app)/app.create.tsx",
      "parent": "/(app)/app"
    },
    "/(app)/app/dashboard": {
      "filePath": "(app)/app.dashboard.tsx",
      "parent": "/(app)/app"
    },
    "/(app)/app/journals": {
      "filePath": "(app)/app.journals.tsx",
      "parent": "/(app)/app"
    }
  }
}
ROUTE_MANIFEST_END */
