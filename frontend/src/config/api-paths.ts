const API_PATHS = {
  AUTH: {
    SIGN_UP: `/api/auth/v1/sign-up`,
    VERIFY_OTP: `/api/auth/v1/verify-otp`,
    SIGN_IN: `/api/auth/v1/sign-in`,
    RESET_PASSWORD: `/api/auth/v1/reset-password`,
    RESET_PASSWORD_VERIFY: `/api/auth/v1/reset-password/verify`,
    LOGOUT: `/api/auth/v1/logout`,
    REFRESH_TOKEN: `/api/auth/v1/refresh-token`,
    GOOGLE_LOGIN: `/api/auth/v1/google/login`,
    GOOGLE_CALLBACK: `/api/auth/v1/google/callback`,
    GET_ME: `/api/auth/v1/me`,
  },
  JOURNALS: {
    ADD_DRAFT: `/api/v1/journals/draft/add`,
    SUBMIT: `/api/v1/journals/draft/submit`,
    GET_ALL: `/api/v1/journals/`,
    LAST_SUBMITTED: `/api/v1/journals/last-submission-date`,
  },
};

export default API_PATHS;
