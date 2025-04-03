import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import "./index.css";
import { ErrorBoundary } from "react-error-boundary";
// Import the generated route tree
import { routeTree } from "./routeTree.gen";
import Spinner from "@/components/ui/spinner/spinner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MainErrorFallback } from "@/components/errors/main";
import { Toaster } from "react-hot-toast";
import { queryConfig } from "@/lib/react-query";

// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
const queryClient = new QueryClient({
  defaultOptions: queryConfig,
});

createRoot(document.getElementById("root")!).render(
  <>
    <Suspense
      fallback={
        <div className="flex h-screen w-screen items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <ErrorBoundary FallbackComponent={MainErrorFallback}>
        <RouterProvider router={router} />
        <QueryClientProvider client={queryClient}>
          {import.meta.env.DEV && <ReactQueryDevtools />}
          <Toaster position="top-right" />
        </QueryClientProvider>
      </ErrorBoundary>
    </Suspense>
  </>
);
