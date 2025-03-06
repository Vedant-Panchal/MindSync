import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ErrorBoundary } from "react-error-boundary";
import { MainErrorFallback } from "@/components/errors/main";
import Spinner from "@/components/ui/spinner/spinner";
import { AuthLoader } from "@/lib/auth";
import { queryConfig } from "@/lib/react-query";
import Landing from "@/app/routes/landing";
import { ReactNode, Suspense, useState } from "react";
import { Toaster } from "react-hot-toast";
type AppProviderProps = {
  children: ReactNode;
};

export const AppProvider = ({ children }: AppProviderProps) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: queryConfig,
      })
  );

  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-screen items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <ErrorBoundary FallbackComponent={MainErrorFallback}>
        <QueryClientProvider client={queryClient}>
          {import.meta.env.DEV && <ReactQueryDevtools />}
          <Toaster position="top-right" />
          {children}
        </QueryClientProvider>
      </ErrorBoundary>
    </Suspense>
  );
};
