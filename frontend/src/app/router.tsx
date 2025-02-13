import { Route, Routes } from "react-router";
import Landing from "./routes/landing";
import SignIn from "@/app/routes/auth/login";
import SignUp from "@/app/routes/auth/signup";

export function AppRouter() {
  return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
  );
}
