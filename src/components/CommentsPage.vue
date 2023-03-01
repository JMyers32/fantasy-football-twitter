<template>
  <q-page class="relative-position">
    <q-scroll-area class="absolute full-width full-height" v-show="showData">
      <q-item to="/" clickable v-ripple exact>
        <q-item-section avatar>
          <q-icon size="md" name="fa-solid fa-arrow-left" />
        </q-item-section>
      </q-item>
      <q-item class="q-py-md">
        <q-item-section avatar top>
          <q-avatar size="xl">
            <img v-if="post.profilePic" :src="post.profilePic" />
            <img
              v-else
              src="../assets/blank-profile-picture-973460_960_720.webp"
            />
          </q-avatar>
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-subtitle1"
            ><strong>{{ post.username }}</strong></q-item-label
          >
          <span class="text-grey-7"
            >{{ post.userhandle }} <br class="lt-md" />
          </span>
          <q-item-label wrap class="text-wrap text-body1">
            {{ post.content }}
          </q-item-label>
        </q-item-section>
      </q-item>
      <q-separator class="divider" size="10px" color="grey-2"></q-separator>
      <div class="q-py-lg q-px-md row items-end q-col-gutter-md">
        <div class="col">
          <q-input
            v-model="newCommentContent"
            placeholder="Comment"
            counter
            maxlength="280"
            bottom-slots
            autogrow
          >
            <template v-slot:before>
              <q-avatar size="xl">
                <img v-if="user.profilePic" :src="user.profilePic" />
                <img
                  v-else
                  src="../assets/blank-profile-picture-973460_960_720.webp"
                />
              </q-avatar>
            </template>
          </q-input>
        </div>
        <div class="col col-shrink">
          <q-btn
            @click="addComment()"
            unelevated
            rounded
            color="primary"
            label="Comment"
            no-caps
            :disable="!newCommentContent"
            class="q-mb-lg"
          />
        </div>
      </div>
      <q-separator class="divider" size="10px" color="grey-2"></q-separator>
      <q-list separator class="post-content">
        <transition-group
          appear
          enter-active-class="animated fadeIn slower"
          leave-active-class="animated fadeOut slow"
        >
          <q-item
            class="q-py-md"
            v-for="comment in filteredComments"
            :key="comment.id"
          >
            <q-item-section avatar top>
              <q-avatar size="xl">
                <img v-if="comment.profilePic" :src="comment.profilePic" />
                <img
                  v-else
                  src="../assets/blank-profile-picture-973460_960_720.webp"
                />
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-subtitle1"
                ><strong>{{ comment.username }}</strong></q-item-label
              >
              <span class="text-grey-7">{{ comment.userhandle }} </span>
              <q-item-label wrap class="text-wrap text-body1">
                {{ comment.content }}
              </q-item-label>
              <div class="row justify=between q-mt-sm post-icons">
                <q-btn
                  v-if="comment.userId === loggedInUser.uid"
                  @click="deleteComment(comment)"
                  color="grey"
                  icon="fas fa-trash"
                  size="sm"
                  flat
                  round
                >
                </q-btn>
              </div>
            </q-item-section>
          </q-item>
        </transition-group>
      </q-list>
    </q-scroll-area>
    <q-inner-loading
      :showing="visible"
      label="Please wait..."
      label-class="text-primary"
      label-style="font-size: 1.1em"
    />
  </q-page>
</template>

<script>
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  addDoc,
  doc,
  deleteDoc,
  where,
  getDoc,
  getDocs,
} from "firebase/firestore";
import db from "src/boot/firebase";
import { mapState } from "vuex";
export default {
  name: "CommentsPage",
  props: ["postId"],
  data() {
    return {
      post: {},
      comments: [],
      user: {},
      handle: {},
      newCommentContent: "",
      visible: false,
      showData: false,
    };
  },
  async mounted() {
    this.getPost();
    await this.fetchUserData();
    this.updateHandle();
    const q = query(collection(db, "comments"), orderBy("date"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        let commentChange = change.doc.data();
        commentChange.id = change.doc.id;
        if (change.type === "added") {
          console.log("New comment: ", commentChange);
          this.comments.unshift(commentChange);
        }
        if (change.type === "modified") {
          console.log("Modified comment: ", commentChange);
          let index = this.comments.findIndex(
            (comment) => comment.id === commentChange.id
          );
          Object.assign(this.comments[index], commentChange);
        }
        if (change.type === "removed") {
          console.log("Removed post: ", commentChange);
          let index = this.comments.findIndex(
            (comment) => comment.id === commentChange.id
          );
          this.comments.splice(index, 1);
        }
      });
    });
  },
  computed: {
    ...mapState("myModule", ["loggedInUser"]),
    filteredComments() {
      return this.comments.filter((comment) => comment.postId === this.post.id);
    },
  },
  methods: {
    showTextLoading() {
      this.visible = true;
      this.showData = false;

      setTimeout(() => {
        this.visible = false;
        this.showData = true;
      }, 1000);
    },
    async getPost() {
      this.post = {};
      const postRef = doc(db, "posts", this.postId);
      const postDoc = await getDoc(postRef);
      this.post = {
        id: postDoc.id,
        ...postDoc.data(),
      };
      this.showTextLoading();
    },
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
    updateHandle() {
      if (this.user && this.user.username) {
        this.handle = "@" + this.user.username.replace(/\s+/g, "_");
      }
    },
    addComment() {
      let newComment = {
        postId: this.postId,
        userId: this.user.uid,
        username: this.user.username,
        userhandle: this.handle,
        profilePic: this.user.profilePic,
        content: this.newCommentContent,
        date: Date.now(),
      };
      const docRef = addDoc(collection(db, "comments"), newComment);
      console.log("Document written with ID: ", docRef.id);
      this.newCommentContent = "";
    },
    deleteComment(comment) {
      deleteDoc(doc(db, "comments", comment.id));
    },
  },
  watch: {
    postId: function (newPostId, oldPostId) {
      if (newPostId !== oldPostId) {
        this.getPost();
      }
    },
    user: {
      immediate: true,
      handler() {
        this.fetchUserData();
        this.updateHandle();
      },
      deep: true,
    },
    loggedInUser: {
      immediate: true,
      handler() {
        this.fetchUserData();
      },
    },
  },
};
</script>

<style lang="sass" scoped>
.post-icons
  margin-left: -5px

.post-content
  white-space: pre-line
</style>
