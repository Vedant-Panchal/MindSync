import Axios, { InternalAxiosRequestConfig } from "axios";
import { env } from "@/config/env";
import toast from "react-hot-toast";
import { useAuthStore } from "@/stores/authStore";
import { router } from "@/main"; // Make sure this is the router instance created by createRouter()

function authRequestInterceptor(config: InternalAxiosRequestConfig) {
  if (config.headers) {
    config.headers.Accept = "application/json";
  }
  return config;
}

export const api = Axios.create({
  baseURL: env.API_URL,
  withCredentials: true,
});
api.defaults.headers.post["Access-Control-Allow-Origin"] = "*";
api.interceptors.request.use(authRequestInterceptor);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const location = router.state.location.pathname;

    const isLandingPage = location === "/";
    const isAuthPage =
      location.startsWith("/signin") || location.startsWith("/signup");

    const message = error.response?.data || error.message;
    if (error.response?.status === 401) {
      if (!isLandingPage && !isAuthPage) {
        useAuthStore.getState().setUser(null);

        toast.error(message, {
          duration: 4000,
          position: "bottom-right",
          ariaProps: {
            role: "alert",
            "aria-live": "polite",
          },
        });

        window.location.href = "/signin";
      }
    }

    return Promise.reject(message);
  }
);
