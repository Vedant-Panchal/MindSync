import { configureAuth } from "react-query-auth";
import { Navigate } from "@tanstack/react-router";
import { z } from "zod";

import { api } from "./api-client";
import API_PATHS from "@/config/api-paths";
import { useAuthStore, User } from "@/stores/authStore";

// api call definitions for auth (types, schemas, requests):
// these are not part of features as this is a module shared across features

export const getUser = async (): Promise<User> => {
  const user: User = await api.get(`${API_PATHS.AUTH.GET_ME}`);
  useAuthStore.getState().setUser(user); // Correct setter function
  return user;
};

const logout = async (): Promise<void> => {
  const response = await api.post(API_PATHS.AUTH.LOGOUT);
  useAuthStore.getState().setUser(null);
  return response.data;
};

export const loginInputSchema = z.object({
  email: z.string().min(1, "Required").email("Invalid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(
      /[^a-zA-Z0-9]/,
      "Password must contain at least one special character",
    ),
});

export type LoginInput = z.infer<typeof loginInputSchema>;
const loginWithEmailAndPassword = async (data: LoginInput): Promise<any> => {
  const response = await api.post(API_PATHS.AUTH.SIGN_IN, data);
  return response;
};

export const registerInputSchema = z.object({
  email: z.string().min(1, "Required").email("Invalid email"),
  firstname: z.string().min(1, "Required"),
  lastname: z.string().min(1, "Required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(
      /[^a-zA-Z0-9]/,
      "Password must contain at least one special character",
    ),
  otp: z.string().length(6, "OTP must be 6 digits"),
});
export const step1Schema = registerInputSchema.pick({ email: true });
export const step2Schema = registerInputSchema
  .pick({
    email: true,
    password: true,
    otp: true,
  })
  .extend({
    username: z.string(),
  });

export type RegisterInput = z.infer<typeof registerInputSchema>;
export type Step1 = z.infer<typeof step1Schema>;
export type Step2 = z.infer<typeof step2Schema>;

const registerWithEmailAndPassword = async (
  data: RegisterInput,
): Promise<any> => {
  const response = await api.post(API_PATHS.AUTH.SIGN_UP, data);
  if (response.status === 200) {
    const user: User = await api.get(`${API_PATHS.AUTH.GET_ME}`);
    useAuthStore.getState().setUser(user);
  }
};

const authConfig = {
  userFn: getUser,
  loginFn: async (data: LoginInput) => {
    const response = await loginWithEmailAndPassword(data);
    return response.user;
  },
  registerFn: async (data: RegisterInput) => {
    const response = await registerWithEmailAndPassword(data);
    return response.user;
  },
  logoutFn: logout,
  userKey: ["user"],
};

export const { useUser, useLogin, useLogout, useRegister, AuthLoader } =
  configureAuth(authConfig);

// ✅ Protect Routes
export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useAuthStore((state) => state.user); // Use Zustand instead of useUser()

  if (!user) {
    return <Navigate to="/signin" />;
  }

  return children;
};
