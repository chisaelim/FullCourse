import { createRouter, createWebHistory } from 'vue-router'
import Signin from '@/components/auth/Signin.vue';
import Signup from '@/components/auth/Signup.vue';
import Signout from '@/components/auth/Signout.vue';
import VerifyEmail from '@/components/auth/VerifyEmail.vue';
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
      path: "/:pathMatch(.*)*",
      redirect: { name: "dashboard" },
    },
  ],
})

export default router
