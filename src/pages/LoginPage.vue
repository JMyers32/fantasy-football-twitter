<template>
  <q-page class="relative-position">
    <q-scroll-area class="absolute full-width full-height">
      <div class="q-py-lg q-px-md col items-end q-col-gutter-md">
        <q-card class="login-card q-pb-md q-ml-md">
          <q-card-section>
            <div class="text-h6">Login To Start Complaining</div>
          </q-card-section>
          <q-card-section>
            <q-input
              v-model="user.email"
              filled
              clearable
              type="email"
              hint="Email"
              class="q-pr-md"
            />
            <q-input
              class="q-mt-md q-pr-md"
              clearable=""
              v-model="user.password"
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
          </q-card-section>
          <q-card-section class="row">
            <q-btn
              unelevated
              rounded
              color="primary"
              label="Login"
              no-caps
              class="q-mt-md login-button"
              :disabled="!readyToSubmit"
              @click="logIn"
            />
            <q-item to="/register" clickable v-ripple exact>
              <q-item-section class="text-h6 text-weight-bold q-pt-md"
                >Need an Account?</q-item-section
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
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import { mapState, mapMutations } from "vuex";
import { Notify } from "quasar";
export default defineComponent({
  name: "LoginPage",
  data() {
    return {
      user: {
        username: "",
        email: "",
        password: "",
      },
      isPwd: true,
    };
  },
  computed: {
    ...mapState("myModule", ["loggedInUser"]),
    emailValid() {
      if (
        this.user.email?.includes("@") &&
        this.user.email?.includes(".") &&
        this.user.email?.length > 5
      ) {
        return true;
      } else return false;
    },
    readyToSubmit() {
      return this.emailValid && !!this.user.password;
    },
  },
  methods: {
    ...mapMutations("myModule", ["SET_USER"]),

    setUser(value) {
      this.SET_USER(value);
    },
    logIn() {
      const auth = getAuth();
      signInWithEmailAndPassword(auth, this.user.email, this.user.password)
        .then((userCredential) => {
          // Signed in
          const user = userCredential.user;
          console.log(user);

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
          // ...
        })
        .catch((error) => {
          Notify.create({
            message: "Invalid Username/Password",
            type: "negative",
          });
          this.user = {};
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
