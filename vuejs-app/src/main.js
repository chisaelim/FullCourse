import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "admin-lte/dist/js/adminlte.min.js";

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
router.beforeEach(async (to, from) => {
  const meta = to.meta;
  if (meta.gaurded === undefined) {
    return;
  }

  try {
    const token = userStore.getSanctumToken();
    const response = await apiVerify(token);
    const { data } = response;
    userStore.setState(data.user);
  } catch (error) {
    if (error.response && error.response.status === 401) {
      userStore.reset();
    }
  }

  if (meta.gaurded === false && userStore.isAuthenticated) {
    return { name: 'dashboard' }
  }
  if (meta.gaurded === true && !userStore.isAuthenticated) {
    return { name: 'auth.signin' }
  }
});

router.afterEach((to, from) => {
  console.log('hello after')
});
