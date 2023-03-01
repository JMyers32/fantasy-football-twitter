<template>
  <q-page class="q-pa-lg">
    <q-card class="my-card">
      <q-avatar size="20vw" class="profilePic q-pt-md">
        <q-img
          v-if="user.profilePic"
          class="userImage"
          :src="user.profilePic"
        />
        <q-img
          class="userImage"
          v-else
          src="../assets/blank-profile-picture-973460_960_720.webp"
        />
      </q-avatar>
      <q-card-section>
        <div class="text-h4 q-pt-md">
          {{ user.username }}<br /><span class="text-h6">{{ handle }}</span>
        </div>
      </q-card-section>

      <q-btn
        @click="editBox = true"
        unelevated
        rounded
        color="primary"
        label="Edit Profile"
        no-caps
        class="q-mb-xl"
        size="large"
      />
      <q-dialog v-model="editBox" full-height full-width>
        <q-card>
          <q-toolbar>
            <q-avatar>
              <img v-if="user.profilePic" :src="user.profilePic" />
              <img
                v-else
                src="../assets/blank-profile-picture-973460_960_720.webp"
              />
            </q-avatar>

            <q-toolbar-title
              ><span class="text-weight-bold">Edit Profile</span>
            </q-toolbar-title>

            <q-btn flat round dense icon="close" v-close-popup />
          </q-toolbar>
          <q-card-section>
            <q-input
              filled
              clearable
              v-model="user.username"
              label="Username"
            />
            <q-input
              class="q-pt-md"
              filled
              clearable
              v-model="user.profilePic"
              label="Profile Pic Url"
            />
          </q-card-section>
          <q-btn
            @click="updateUser"
            unelevated
            rounded
            color="primary"
            label="Edit Profile"
            no-caps
            class="q-mb-xl q-ml-md"
          />
        </q-card>
      </q-dialog>
    </q-card>
  </q-page>
</template>

<script>
import { defineComponent } from "vue";
import db from "src/boot/firebase";
import { mapState } from "vuex";
import {
  collection,
  query,
  where,
  addDoc,
  getDocs,
  forEach,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
export default defineComponent({
  name: "ProfilePage",

  data() {
    return {
      user: {},
      editBox: false,
      handle: "",
    };
  },
  computed: {
    ...mapState("myModule", ["loggedInUser"]),
  },
  async mounted() {
    await this.fetchUserData();
    this.updateHandle();
  },
  watch: {
    loggedInUser: {
      immediate: true,
      handler() {
        this.fetchUserData();
      },
    },
    user: {
      immediate: true,
      handler() {
        this.updateHandle();
      },
      deep: true,
    },
  },
  methods: {
    async fetchUserData() {
      if (this.loggedInUser) {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("uid", "==", this.loggedInUser.uid));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          this.user = doc.data();
        });
      }
    },
    async updateUser() {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", this.user.email));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((user) => {
        const userDocRef = doc(usersRef, user.id);
        updateDoc(userDocRef, {
          username: this.user.username,
          profilePic: this.user.profilePic,
          uid: this.user.uid,
          email: this.user.email,
        });
      });
      this.editBox = false;
    },
    updateHandle() {
      if (this.user && this.user.username) {
        this.handle = "@" + this.user.username.replace(/\s+/g, "_");
      }
    },
  },
});
</script>
<style lang="sass" scoped>
.my-card
  width: 100%
  text-align: center
  align-items: center
  display: flex
  text-align: center
  align-items: center
  display: flex
  justify-content: center
  flex-direction: column

  .profilePic
    border-radius:50%

  .userImage
    width:100%
    height:100%
</style>
