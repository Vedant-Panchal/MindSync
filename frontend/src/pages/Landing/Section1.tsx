import { ArrowRight, MenuIcon } from "lucide-react";
import MindSyncLogo from "@/assets/logo.svg?react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";

const navigation = [
  { name: "Features", href: "#" },
  { name: "How it works", href: "#" },
  { name: "Pricing", href: "#" },
  { name: "About", href: "#" },
];

export default function Section1({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <div className="bg-white">
      <header className="absolute inset-x-0 top-0 z-50">
        <nav
          aria-label="Global"
          className="flex items-center justify-between p-6 lg:px-8"
        >
          <div className="flex lg:flex-1">
            <Link to="/">
              <span className="sr-only">MindSync</span>
              <MindSyncLogo className="fill-sidebar-foreground hover:fill-primary size-6 transition-colors duration-300" />
            </Link>
          </div>
          <div className="flex lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
                >
                  <span className="sr-only">Open main menu</span>
                  <MenuIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-full bg-white/80 backdrop-blur-md"
              >
                <SheetHeader>
                  <SheetTitle className="mt-4 px-4 text-2xl">Menu</SheetTitle>
                </SheetHeader>
                <div className="mt-6 flow-root">
                  <div className="-my-6 divide-y divide-gray-500/10">
                    <div className="space-y-5 px-5 py-6">
                      {navigation.map((item) => (
                        <a
                          key={item.name}
                          href={item.href}
                          className="block rounded-lg px-3 py-2 text-xl leading-7 font-semibold text-gray-900 hover:bg-gray-50"
                        >
                          {item.name}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          <div className="hidden lg:flex lg:gap-x-12">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-sm leading-6 font-semibold text-gray-900"
              >
                {item.name}
              </a>
            ))}
          </div>
          <div className="hidden lg:flex lg:flex-1 lg:justify-end">
            {isLoggedIn ? (
              <Link
                to="/app/dashboard"
                className="bg-primary hover:bg-primary/90 focus-visible:outline-primary rounded-md px-3.5 py-1.5 text-sm font-semibold text-gray-100 shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                to="/signin"
                className="bg-primary hover:bg-primary/90 focus-visible:outline-primary rounded-md px-3.5 py-1.5 text-sm font-semibold text-gray-100 shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                Log in
              </Link>
            )}
          </div>
        </nav>
      </header>

      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        >
          <div
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
            className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36.125rem] -translate-x-1/2 bg-linear-to-tr from-blue-400 to-sky-800 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          />
        </div>
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="hidden sm:mb-8 sm:flex sm:justify-center"></div>
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <h1 className="text-6xl font-black tracking-tight text-balance text-gray-900 sm:text-7xl">
                AI Powered Journaling for Deeper Insights
              </h1>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.7 }}
            >
              <p className="mt-8 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8">
                Transform your daily thoughts into meaningful insights with our
                AI-powered journaling platform. Track patterns, receive
                personalized reflections, and grow with every entry you make.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link
                  to="/signin"
                  className="bg-primary hover:bg-primary/90 focus-visible:outline-primary rounded-md px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs transition-all focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  Start journaling
                </Link>
                <a href="#" className="text-sm/6 font-semibold text-gray-900">
                  See how it works <span aria-hidden="true">→</span>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
        >
          <div
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
            className="relative left-[calc(50%+3rem)] aspect-1155/678 w-[36.125rem] -translate-x-1/2 bg-linear-to-tr from-blue-400 to-sky-800 opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
          />
        </div>
      </div>
    </div>
  );
}
