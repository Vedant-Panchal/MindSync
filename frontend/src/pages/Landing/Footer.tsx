import { Link } from "@tanstack/react-router";

function Footer() {
  return (
    <div className="mx-auto mt-auto w-full max-w-[85rem] border-t border-gray-200 px-4 py-10 sm:px-6 lg:px-8">
      <div className="text-center">
        <div>
          <Link
            className="flex items-center text-xl font-semibold text-black dark:text-white"
            to="/"
            aria-label="Brand"
          >
            <img
              src="/apple-touch-icon.png"
              alt="MindSync Logo"
              className="h-9 w-9"
            />
            MindSync
          </Link>
        </div>

        <div className="mt-3">
          <p className="text-gray-500 dark:text-neutral-500">
            Crafted with 😻 by MindSync
          </p>
        </div>
      </div>
    </div>
  );
}

export default Footer;
