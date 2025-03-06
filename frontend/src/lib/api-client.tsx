import Axios, { InternalAxiosRequestConfig } from 'axios';
import { env } from '@/config/env';
import { paths } from '@/config/paths';
import axios from 'axios';
import toast from 'react-hot-toast';

function authRequestInterceptor(config: InternalAxiosRequestConfig) {
  if (config.headers) {
    config.headers.Accept = 'application/json';
  }
  return config;
}

export const api = Axios.create({
  baseURL: "http://localhost:8000",
  withCredentials:true
});
api.defaults.headers.post['Access-Control-Allow-Origin'] = '*';
api.interceptors.request.use(authRequestInterceptor);
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const message = error.response?.data?.message || error.message;
    toast.error(message, {
      duration: 4000, // 4 seconds
      position: "top-right",
      ariaProps: {
        role: "alert",
        "aria-live": "polite",
      },
    });

    // if (error.response?.status === 401) {  
    //   const searchParams = new URLSearchParams();
    //   const redirectTo =
    //     searchParams.get('redirectTo') || window.location.pathname;
    //   window.location.href = paths.auth.login.getHref(redirectTo);
    // }

    return Promise.reject(error);
  },
);