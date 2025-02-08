import AppProvider from "@/app/provider";
import { Router } from "./router";

export const App = () => {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  );
};