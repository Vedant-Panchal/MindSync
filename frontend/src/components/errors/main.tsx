import { Button } from "../ui/button";
import NotFound from "@/assets/NotFound.svg";
export const MainErrorFallback = () => {
  return (
    <div className="grid h-screen place-content-center bg-white px-4">
      <div className="text-center flex flex-col items-center justify-center gap-2">
        <NotFound />
        <h1 className="mt-6 text-2xl font-bold text-gray-900 sm:text-4xl">
          Uh-oh!
        </h1>
        <div
          className="flex h-screen w-screen flex-col items-center justify-center text-red-500"
          role="alert"
        >
          <h2 className="text-lg font-semibold">
            Ooops, something went wrong :({" "}
          </h2>
          <Button
            className="mt-4"
            onClick={() => window.location.assign(window.location.origin)}
          >
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
};
