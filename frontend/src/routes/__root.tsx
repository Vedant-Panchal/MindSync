import {
  Outlet,
  createRootRoute,
  useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Link } from "@tanstack/react-router";
import NotFound from "@/assets/NotFound.svg";
import { Spinner } from "@/components/ui/spinner";

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootComponent() {
  const isLoading = useRouterState({ select: (s) => s.status === "pending" });

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <Spinner />
      </div>
    );
  }
  return (
    <div className="h-screen w-screen antialiased relative">
      <Outlet />
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </div>
  );
}

function NotFoundComponent() {
  return (
    <div className="grid h-screen place-content-center bg-white px-4">
      <div className="text-center flex flex-col items-center justify-center gap-2">
        <NotFound />
        <h1 className="mt-6 text-2xl font-bold text-gray-900 sm:text-4xl">
          Uh-oh!
        </h1>

        <p className="text-gray-500">We can't find that page.</p>
        <Link
          className="px-4 py-2 container w-fit rounded-md bg-slate-200"
          to="/"
          replace
        >
          Go to Home
        </Link>
      </div>
    </div>
  );
}
