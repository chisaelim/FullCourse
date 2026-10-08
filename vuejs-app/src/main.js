import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "admin-lte/dist/js/adminlte.min.js";
import axios from "axios";
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useUserStore } from "./stores/user.js";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { apiVerify } from '@/functions/api/auth.js'

const app = createApp(App)
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

app.use(pinia)
app.use(router)

app.mount('#app');

const userStore = useUserStore()

// Set up Axios interceptor to add Authorization header dynamically
// Only when the token is available and not already set in the request
axios.interceptors.request.use((config) => {
  const token = userStore.getSanctumToken();
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


router.beforeEach(async (to, from) => {
  const meta = to.meta;
  if (meta.guarded === undefined) {
    return;
  }

  try {
    const response = await apiVerify();
    const { data } = response;
    userStore.setState(data.user);
  } catch (error) {
    if (error.response && error.response.status === 401) {
      userStore.reset();
    }
  }



  if (meta.guarded === false && userStore.isAuthenticated) {
    return { name: 'dashboard' }
  }
  if (meta.guarded === true && !userStore.isAuthenticated) {
    return { name: 'auth.signin' }
  }
});

router.afterEach((to, from) => {
  console.log('hello after')
});
