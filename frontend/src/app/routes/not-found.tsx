import { paths } from "@/config/paths";
import { Link } from "react-router";
import NotFound from "@/assets/NotFound.svg";
const NotFoundRoute = () => {
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
          to={paths.home.getHref()}
          replace
        >
          Go to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundRoute;
