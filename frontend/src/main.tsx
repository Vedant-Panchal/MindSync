import { Suspense } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import "./index.css";
import { ErrorBoundary } from "react-error-boundary";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MainErrorFallback } from "@/components/errors/main";
import { Toaster } from "react-hot-toast";
import { queryConfig } from "@/lib/react-query";
import { routeTree } from "@/routeTree.gen";
import { useAuthStore, User } from "@/stores/authStore";
import API_PATHS from "@/config/api-paths";
import { api } from "@/lib/api-client";
import { Spinner } from "@/components/ui/spinner";
import { TooltipProvider } from "@/components/ui/tooltip";

const queryClient = new QueryClient({
  defaultOptions: queryConfig,
});

export const router = createRouter({
  routeTree,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
const preloadUser = async () => {
  const existingUser = useAuthStore.getState().user;
  if (existingUser) {
    console.log("User already loaded:", existingUser);
    return;
  }

  try {
    const user: User = await api.get(API_PATHS.AUTH.GET_ME);
    const lastSubmitted: { last_submission_date: string } = await api.get(
      API_PATHS.JOURNALS.LAST_SUBMITTED,
    );
    console.log("User fetched:", user); // Debug log
    console.log("User fetched:", lastSubmitted); // Debug log
    useAuthStore.setState({
      user: {
        ...user,
        lastSubmitted: lastSubmitted.last_submission_date,
      },
    });
  } catch (error) {
    console.error("Failed to fetch user:", error); // Debug log
    useAuthStore.setState({ user: null });
  }
};

preloadUser().then(() => {
  createRoot(document.getElementById("root")!).render(
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary FallbackComponent={MainErrorFallback}>
        <Suspense>
          <TooltipProvider>
            <RouterProvider
              router={router}
              defaultPendingComponent={() => (
                <div className="bg-background flex h-full w-full items-center justify-center">
                  <Spinner />
                </div>
              )}
            />
          </TooltipProvider>
        </Suspense>
        {import.meta.env.DEV && <ReactQueryDevtools />}
        <Toaster position="top-center" />
      </ErrorBoundary>
    </QueryClientProvider>,
  );
});
