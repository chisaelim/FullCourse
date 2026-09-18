import { createRouter, createWebHistory } from 'vue-router'
import Signin from '@/components/auth/Signin.vue';
import Signup from '@/components/auth/Signup.vue';
import Signout from '@/components/auth/Signout.vue';
import VerifyEmail from '@/components/auth/VerifyEmail.vue';
import ResetPassword from '@/components/auth/ResetPassword.vue';
import SetNewPassword from '@/components/auth/SetNewPassword.vue';
import GoogleOAuth from '@/components/auth/GoogleOAuth.vue';
import Dashboard from '@/components/pages/Dashboard.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'auth.signin',
      component: Signin,
      meta: {
        guarded: false
      },
    },
    {
      path: '/signup',
      name: 'auth.signup',
      component: Signup,
      meta: {
        guarded: false
      },
    },
    {
      path: '/signout',
      name: 'auth.signout',
      component: Signout,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard,
      meta: {
        guarded: true
      },
    },
    {
      path: "/verify/email",
      name: "auth.verify.email",
      component: VerifyEmail,
      meta: {
        guarded: false
      },
    },
    {
      path: "/reset-password",
      name: "auth.reset-password",
      component: ResetPassword,
      meta: { guarded: false },
    },
    {
      path: "/set-new-password",
      name: "auth.set-new-password",
      component: SetNewPassword,
      meta: { guarded: false },
    },
    {
      path: "/google/oauth/callback",
      name: "auth.google.oauth.callback",
      component: GoogleOAuth,
      meta: { guarded: false },
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: { name: "dashboard" },
    },
  ],
})

export default router
