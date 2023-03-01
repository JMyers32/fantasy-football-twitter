<template>
  <q-layout view="lHr lpR fFf">
    <q-header bordered class="bg-white text-black">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />
        <q-toolbar-title class="text-weight-bold">
          <span class="gt-sm">{{ $route.name }}</span>
          <q-icon
            class="q-pa-md lt-md header-icon"
            size="sm"
            color="primary"
            name="fa-solid fa-football"
          />
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer
      show-if-above
      v-model="leftDrawerOpen"
      side="left"
      :width="283"
      bordered
    >
      <q-icon
        class="q-pa-md"
        size="lg"
        color="primary"
        name="fa-solid fa-football"
      />

      <q-list>
        <q-item to="/" clickable v-ripple exact>
          <q-item-section avatar>
            <q-icon size="md" name="home" />
          </q-item-section>

          <q-item-section class="text-h6 text-weight-bold">Home</q-item-section>
        </q-item>

        <q-item to="/about" clickable v-ripple exact>
          <q-item-section avatar>
            <q-icon size="md" name="help" />
          </q-item-section>

          <q-item-section class="text-h6 text-weight-bold"
            >About</q-item-section
          >
        </q-item>

        <q-item v-if="loggedInUser" to="/profile" clickable v-ripple exact>
          <q-item-section avatar>
            <q-icon size="md" name="fa-solid fa-user" />
          </q-item-section>

          <q-item-section class="text-h6 text-weight-bold"
            >Profile</q-item-section
          >
        </q-item>

        <q-item to="/stats" clickable v-ripple exact>
          <q-item-section avatar>
            <q-icon size="md" name="fa-solid fa-chart-simple" />
          </q-item-section>

          <q-item-section class="text-h6 text-weight-bold"
            >Hall Of Records</q-item-section
          >
        </q-item>

        <q-item to="/login" clickable v-ripple exact v-if="!loggedInUser">
          <q-item-section avatar>
            <q-icon size="md" name="fa-solid fa-right-to-bracket" />
          </q-item-section>
          <q-item-section class="text-h6 text-weight-bold"
            >Login</q-item-section
          >
        </q-item>
        <q-item to="/login" clickable v-ripple exact v-if="loggedInUser">
          <q-item-section avatar>
            <q-icon size="md" name="fa-solid fa-right-to-bracket" />
          </q-item-section>
          <q-item-section @click="logout" class="text-h6 text-weight-bold"
            >Logout</q-item-section
          >
        </q-item>
      </q-list>
    </q-drawer>

    <q-drawer show-if-above v-model="rightDrawerOpen" side="right" bordered>
      <q-input class="q-ma-md" outlined rounded placeholder="Search" dense>
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
      </q-input>

      <q-list padding separator>
        <q-item class="q-pa-md">
          <q-item-section>
            <q-item-label overline class="text-grey"
              >League Update</q-item-label
            >
            <q-item-label class="text-weight-bold">Dom Wins</q-item-label>
            <q-item-label caption
              >Dom has won the 12ADOH championship. Everyone is terribly
              saddended.</q-item-label
            >
          </q-item-section>

          <q-item-section side top>
            <q-item-label caption></q-item-label>
          </q-item-section>
        </q-item>

        <q-item class="q-pa-md">
          <q-item-section>
            <q-item-label overline class="text-grey"
              >League Update</q-item-label
            >
            <q-item-label class="text-weight-bold">TJ Loses Bet</q-item-label>
            <q-item-label caption
              >TJ has lost bet round 2 and now must get a tattoo of Dom's
              choosing. What will it be?</q-item-label
            >
          </q-item-section>

          <q-item-section side top>
            <q-item-label caption></q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </q-page-container>
  </q-layout>
</template>

<script>
import { ref } from "vue";
import { mapMutations, mapState } from "vuex";
export default {
  data() {
    return {
      logInOut: "",
    };
  },
  setup() {
    const leftDrawerOpen = ref(false);
    const rightDrawerOpen = ref(false);

    return {
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },

      rightDrawerOpen,
      toggleRightDrawer() {
        rightDrawerOpen.value = !rightDrawerOpen.value;
      },
    };
  },
  computed: {
    ...mapState("myModule", ["loggedInUser"]),
  },
  methods: {
    ...mapMutations("myModule", ["LOGOUT"]),
    logout() {
      this.LOGOUT();
    },
  },
};
</script>
<style lang="sass">
.header-icon
  postion: absolute
  bottom: 0
  left: 50%
  transform: translateX(-80%)
</style>
