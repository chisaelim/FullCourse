<template>
  <div class="login-page">
    <div class="login-box">
      <div class="card card-outline card-primary">
        <div class="card-header text-center">
          <RouterLink to="/" class="h1"><b>Admin</b>LTE</RouterLink>
        </div>
        <div class="card-body">
          <p class="login-box-msg">Sign up for a new membership</p>
          <form @submit.prevent="signUp">
            <div class="input-group mb-3">
              <input v-model="user.name" type="text" class="form-control" :class="{ 'is-invalid': !!userError.name }"
                placeholder="Name" />
              <div class="input-group-append">
                <div class="input-group-text">
                  <span class="fas fa-user"></span>
                </div>
              </div>
              <div class="invalid-feedback">{{ userError.name }}</div>
            </div>
            <div class="input-group mb-3">
              <input v-model="user.email" type="email" class="form-control" :class="{ 'is-invalid': !!userError.email }"
                placeholder="Email" />
              <div class="input-group-append">
                <div class="input-group-text">
                  <span class="fas fa-envelope"></span>
                </div>
              </div>
              <div class="invalid-feedback">{{ userError.email }}</div>
            </div>
            <div class="input-group mb-3">
              <input v-model="user.password" type="password" class="form-control"
                :class="{ 'is-invalid': !!userError.password }" placeholder="Password" autocomplete />
              <div class="input-group-append">
                <div class="input-group-text">
                  <span class="fas fa-lock"></span>
                </div>
              </div>
              <div class="invalid-feedback">{{ userError.password }}</div>
            </div>
            <div class="input-group mb-3">
              <input v-model="user.password_confirmation" type="password" class="form-control"
                placeholder="Confirm Password" autocomplete />
              <div class="input-group-append">
                <div class="input-group-text">
                  <span class="fas fa-lock"></span>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-8"></div>
              <div class="col-4">
                <button type="submit" class="btn btn-primary btn-block">
                  Sign up
                </button>
              </div>
            </div>
          </form>
          <p class="mb-1">
            <RouterLink :to="{ name: 'auth.signin' }" class="text-center">I already have an account</RouterLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { apiSignUp } from '@/functions/api/auth'
import { LoadingModal, MessageModal, CloseModal } from '@/functions/swal';
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();

const user = reactive({
  name: "",
  email: "",
  password: "",
  password_confirmation: "",
});

const userError = reactive({
  name: "",
  email: "",
  password: "",
});

const defaultUser = JSON.parse(JSON.stringify(user));
const defaultUserError = JSON.parse(JSON.stringify(userError));

function resetAllState() {
  Object.assign(user, defaultUser);
  Object.assign(userError, defaultUserError);
}

async function signUp() {
  try {
    LoadingModal('Signing Up')
    const response = await apiSignUp(user);
    resetAllState();
    return MessageModal({
      icon: "success",
      title: "Success",
      text: response.data.message,
    }, () => router.push({ name: 'auth.signin' }));
  } catch (error) {
    const { response } = error;
    if (!response) {
      return MessageModal({
        icon: "error",
        title: "Error",
        text: error.message,
      });
    }
    const { status, data } = response;
    if (status === 422) {
      Object.keys(userError).forEach((key) => {
        userError[key] = data.errors[key] ? data.errors[key][0] : "";
      });
      return CloseModal();
    }
    return MessageModal({
      icon: "error",
      title: "Error",
      text: data.message,
    });
  }
}
</script>
