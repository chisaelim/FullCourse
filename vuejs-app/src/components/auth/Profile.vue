<template>
  <div class="content-wrapper" style="min-height: 1175px;">
    <div class="content-header">
      <div class="container-fluid">
        <div class="row mb-2">
          <div class="col-sm-6">
            <h1 class="m-0">Profile</h1>
          </div>
          <div class="col-sm-6">
            <ol class="breadcrumb float-sm-right">
              <li class="breadcrumb-item">
                <a href="#">Home</a>
              </li>
              <li class="breadcrumb-item active">Profile</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
    <div class="content">
      <div class="container-fluid">
        <div class="row">
          <div class="col-lg-6">
            <div class="card card-primary card-outline">
              <div class="card-body box-profile">
                <div class="text-center">
                  <img class="profile-user-img img-fluid img-circle"
                    :src="tempImage || userStore.profile_image || emptyImage" alt="User profile picture" />
                </div>
                <h3 class="profile-username text-center">
                  {{ userStore.name }}
                </h3>
                <!-- <p class="text-muted text-center">{{ userStore.level }}</p> -->
                <input @change="onImageChanged" type="file" class="d-none"
                  :accept="allowedExtensions.map((ext) => '.' + ext).join(', ')" id="image-input" />
                <div class="mt-1">
                  <label :for="'image-input'">
                    <a type="button" class="m-1 btn btn-primary btn-sm"><i class="fas fa-upload"></i></a>
                  </label>
                  <a @click="deleteImage" type="button" class="m-1 btn btn-danger btn-sm"><i
                      class="fas fa-trash"></i></a>
                  <a @click="resetImage" type="button" class="m-1 btn btn-secondary btn-sm"><i
                      class="fas fa-undo-alt"></i></a>
                  <a v-if="selectedImageFile" @click="saveImage" type="button" class="m-1 btn btn-success btn-sm"><i
                      class="fas fa-check"></i></a>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-6">
            <div class="card card-primary card-outline card-outline-tabs">
              <div class="card-header p-0 border-bottom-0">
                <ul class="nav nav-tabs" id="customTabs" role="tablist">
                  <li class="nav-item">
                    <a class="nav-link active" id="password-tab" data-toggle="pill" href="#password-tab-content"
                      role="tab" aria-controls="password" aria-selected="false">Home</a>
                  </li>
                </ul>
              </div>
              <div class="card-body">
                <div class="tab-content" id="customTabsContent">
                  <div class="tab-pane fade show active" id="password-tab-content" role="tabpanel"
                    aria-labelledby="password-tab">

                    <form @submit.prevent="savePassword" class="form-horizontal">
                      <div v-if="!userStore.password_null" class="form-group row">
                        <label class="col-sm-3 col-form-label">Current Password</label>
                        <div class="col-sm-9">
                          <input v-model="user.current_password" type="password" class="form-control"
                            placeholder="Current Password" :class="!!userError.current_password ? 'is-invalid' : ''" />
                          <div class="invalid-feedback">
                            {{ userError.current_password }}
                          </div>
                        </div>
                      </div>
                      <div class="form-group row">
                        <label class="col-sm-3 col-form-label">New Password</label>
                        <div class="col-sm-9">
                          <input v-model="user.new_password" type="password" class="form-control"
                            placeholder="New Password" :class="!!userError.new_password ? 'is-invalid' : ''" />
                          <div class="invalid-feedback">
                            {{ userError.new_password }}
                          </div>
                        </div>
                      </div>
                      <div class="form-group row">
                        <label class="col-sm-3 col-form-label">Confirm Password</label>
                        <div class="col-sm-9">
                          <input v-model="user.new_password_confirmation" type="password" class="form-control"
                            placeholder="Confirm Password" />
                        </div>
                      </div>

                      <div class="form-group row">
                        <div class="offset-sm-2 col-sm-10">
                          <button type="reset" class="mx-3 btn btn-danger">Cancel</button>
                          <button type="submit" class="mx-3 btn btn-outline-primary">
                            Save
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
              <!-- /.card -->
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { useUserStore } from "@/stores/user";
import emptyImage from "@/assets/images/emptyImage.png";
import { reactive, ref } from "vue";
import { apiCreatePassword, apiChangePassword, apiUpdateProfileImage, apiDeleteProfileImage } from "@/functions/api/auth.js";
import { LoadingModal, MessageModal, CloseModal } from "@/functions/swal.js";
import { useRouter } from "vue-router";
const userStore = useUserStore();
const router = useRouter();


const user = reactive({
  current_password: "",
  new_password: "",
  new_password_confirmation: "",
});

const userError = reactive({
  current_password: "",
  new_password: "",
});

const defaultUser = JSON.parse(JSON.stringify(user));
const defaultUserError = JSON.parse(JSON.stringify(userError));

function resetAllState() {
  Object.assign(user, defaultUser);
  Object.assign(userError, defaultUserError);
}

async function savePassword() {
  try {
    LoadingModal('Saving password...');
    const response = userStore.password_null
      ? await apiCreatePassword(
        user.new_password,
        user.new_password_confirmation
      )
      : await apiChangePassword(
        user.current_password,
        user.new_password,
        user.new_password_confirmation
      );

    resetAllState();
    await MessageModal({ icon: "success", title: "Success", text: response.data.message, }, () => router.push({ name: "auth.signin" }));
  } catch (error) {
    const { response } = error;
    if (!response) {
      return MessageModal({ icon: "error", title: "Error", text: error.message });
    }
    const { status, data } = response;
    if (status === 422) {
      Object.keys(userError).forEach((key) => {
        userError[key] = data.errors[key]
          ? data.errors[key][0]
          : "";
      });
      return CloseModal();
    }
    return MessageModal({ icon: "error", title: "Error", text: data.message });
  }
}

const allowedExtensions = ["jpg", "jpeg", "png"];

const selectedImageFile = ref(null);
const tempImage = ref(null);

function onImageChanged(event) {
  const file = event.target.files[0];
  if (file) {
    const extension = file.name.split(".").pop().toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      return MessageModal({ icon: "error", title: "Error", text: "Invalid file type." });
    }

    const reader = new FileReader();
    reader.onloadend = function () {
      const img = new Image();
      img.onload = function () {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Set canvas size to 454x454
        canvas.width = 454;
        canvas.height = 454;

        // Calculate crop dimensions (center crop)
        const size = Math.min(img.width, img.height);
        const x = (img.width - size) / 2;
        const y = (img.height - size) / 2;

        // Draw image cropped and resized to 454x454
        ctx.drawImage(img, x, y, size, size, 0, 0, 454, 454);

        canvas.toBlob((blob) => {
          if (!blob) {
            return MessageModal({ icon: "error", title: "Error", text: "Failed to process image. Please try again." });
          }

          selectedImageFile.value = new File([blob], "profile.png", { type: "image/png" });
          tempImage.value = canvas.toDataURL("image/png");
        }, "image/png");
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
    event.target.value = null;
  }
}

async function saveImage() {
  try {
    LoadingModal('Uploading...');
    const response = await apiUpdateProfileImage(selectedImageFile.value);

    userStore.profile_image = response.data.profile_image;
    userStore.profile_thumbnail = response.data.profile_thumbnail;
    selectedImageFile.value = null;
    tempImage.value = null;

    CloseModal();
  } catch (error) {
    MessageModal({ icon: "error", title: "Error", text: error.message });
  }
}

function resetImage() {
  selectedImageFile.value = null;
  tempImage.value = null;
}

async function deleteImage() {
  try {
    LoadingModal('Deleting...');
    const response = await apiDeleteProfileImage();

    userStore.profile_image = response.data.profile_image;
    userStore.profile_thumbnail = response.data.profile_thumbnail;
    selectedImageFile.value = null;
    tempImage.value = null;

    CloseModal();
  } catch (error) {
    MessageModal({ icon: "error", title: "Error", text: error.message });
  }
}


</script>
