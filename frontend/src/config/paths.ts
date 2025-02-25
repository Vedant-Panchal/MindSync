export const paths = {
    home: {
        path: '/',
        getHref: () => '/',
    },

    auth: {
        signup: {
            path: '/auth/signup',
            getHref: (redirectTo?: string | null | undefined) =>
                `/auth/signup${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`,
        },
        login: {
            path: '/auth/login',
            getHref: (redirectTo?: string | null | undefined) =>
                `/auth/login${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`,
        },
    },

    app: {
        root: {
            path: '/app',
            getHref: () => '/app',
        },
        dashboard: {
            path: '',
            getHref: () => '/app',
        },
        profile: {
            path: 'profile',
            getHref: () => '/app/profile',
        },
    },
} as const;