export const routes = {
  home: '/',
  learn: '/learn',
  login: '/login',
  register: '/register',
  demo: '/demo',
  dashboard: {
    root: '/dashboard',
    quizzes: '/dashboard/quizzes',
    quizz: (quizId: string) => `/dashboard/quizzes/${quizId}`,
    quizRetake: (quizId: string) => `/dashboard/quizzes/${quizId}/retake`,
  },
  settings: {
    root: '/settings',
  },
  auth: {
    login: '/login',
    register: '/register',
    confirm: '/auth/confirm',
    authCodeError: '/auth/auth-code-error',
    callback: '/auth/callback',
  },
};
