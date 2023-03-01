<template>
  <q-page class="relative-position">
    <q-scroll-area class="absolute full-width full-height">
      <div class="q-py-lg q-px-md col items-end q-col-gutter-md">
        <q-card class="login-card q-pb-md q-ml-md">
          <q-card-section>
            <div class="text-h6">Create An Account</div>
          </q-card-section>
          <q-card-section>
            <q-input
              v-model="newUser.username"
              filled
              type="text"
              hint="Username"
              class="q-pr-md q-pb-lg q-mb-sm"
              clearable
            />
            <q-input
              v-model="newUser.email"
              filled
              type="email"
              hint="Email"
              class="q-pr-md"
              clearable
            />
            <q-input
              class="q-mt-md q-pr-md"
              clearable
              v-model="newUser.password"
              filled
              :type="isPwd ? 'password' : 'text'"
              hint="Password"
            >
              <template v-slot:append>
                <q-icon
                  :name="isPwd ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="isPwd = !isPwd"
                />
              </template>
            </q-input>
            <q-input
              class="q-mt-md q-pr-md"
              clearable
              v-model="confirmPassword"
              filled
              :type="isPwd ? 'password' : 'text'"
              hint="Confirm Password"
            >
              <template v-slot:append>
                <q-icon
                  :name="isPwd ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="isPwd = !isPwd"
                />
              </template>
            </q-input>
          </q-card-section>
          <q-card-section class="row">
            <q-btn
              unelevated
              rounded
              color="primary"
              label="Register"
              no-caps
              class="q-mt-md login-button"
              :disabled="!readyToSubmit"
              @click="signUp"
            />
            <q-item to="/login" clickable v-ripple exact>
              <q-item-section class="text-h6 text-weight-bold q-pt-md"
                >Have an Account?</q-item-section
              >
            </q-item>
          </q-card-section>
        </q-card>
      </div>
    </q-scroll-area>
  </q-page>
</template>
<script>
import { defineComponent } from "vue";
import {
  getAuth,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import db from "src/boot/firebase";
import { collection, addDoc } from "firebase/firestore";
import { mapState, mapMutations } from "vuex";
import { Notify } from "quasar";
export default defineComponent({
  name: "RegisterPage",
  data() {
    return {
      newUser: {
        username: "",
        email: "",
        password: "",
        profilePic: "",
      },
      confirmPassword: "",
      isPwd: true,
    };
  },
  computed: {
    ...mapState("myModule", ["loggedInUser"]),

    emailValid() {
      if (
        this.newUser.email?.includes("@") &&
        this.newUser.email?.includes(".") &&
        this.newUser.email?.length > 5
      ) {
        return true;
      } else return false;
    },
    passwordMatches() {
      if (
        this.newUser.password === this.confirmPassword &&
        !!this.newUser.password
      ) {
        return true;
      } else return false;
    },
    readyToSubmit() {
      return this.emailValid && this.passwordMatches;
    },
  },
  methods: {
    ...mapMutations("myModule", ["SET_USER"]),
    setUser(value) {
      this.SET_USER(value);
    },
    signUp() {
      const auth = getAuth();

      createUserWithEmailAndPassword(
        auth,
        this.newUser.email,
        this.newUser.password,
        this.newUser.username,
        this.newUser.profilePic
      )
        .then((userCredential) => {
          const createdUser = userCredential.user;

          const addedUser = {
            username: this.newUser.username,
            uid: createdUser.uid,
            email: createdUser.email,
            profilePic: this.newUser.profilePic,
          };
          console.log(addedUser);
          const docRef = addDoc(collection(db, "users"), addedUser);
          console.log("Document written with ID: ", docRef.id);

          this.newUser = {
            username: "",
            email: "",
            password: "",
            profilePic: "",
          };

          this.confirmPassword = "";
          onAuthStateChanged(auth, (user) => {
            if (user) {
              // User is signed in, see docs for a list of available properties
              // https://firebase.google.com/docs/reference/js/firebase.User
              let loggedInUser = {
                uid: user.uid,
                email: user.email,
              };
              this.setUser(loggedInUser);

              this.$router.push("/");
              this.user = {};

              // ...
            } else {
              // User is signed out
            }
          });
        })
        .catch((error) => {
          Notify.create({
            message: "Email Already In Use",
            type: "info",
          });
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log(errorCode + " | " + errorMessage);
        });
    },
  },
});
</script>
<style scoped lang="sass">

.login-button
  font-size: large
</style>
