import AppProvider from "@/app/provider";
import { AppRouter } from "./router";

export const App = () => {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
};