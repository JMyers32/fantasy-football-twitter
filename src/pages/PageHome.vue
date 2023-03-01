<template>
  <q-page class="relative-position">
    <q-scroll-area
      class="absolute full-width full-height"
      ref="scrollArea"
      @scroll="handleScroll"
    >
      <div class="q-py-lg q-px-md row items-end q-col-gutter-md">
        <div class="col">
          <q-input
            v-model="newPostContent"
            placeholder="What's happening?"
            counter
            maxlength="280"
            bottom-slots
            autogrow
            class="new-post"
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
            @click="addNewPost"
            unelevated
            rounded
            color="primary"
            label="Complain"
            no-caps
            :disable="!newPostContent"
            class="q-mb-lg"
          />
        </div>
      </div>
      <q-separator class="divider" size="10px" color="grey-2" />
      <q-list separator class="post-content">
        <transition-group
          appear
          enter-active-class="animated fadeIn slower"
          leave-active-class="animated fadeOut slow"
        >
          <q-item class="q-py-md" v-for="post in displayedPosts" :key="post.id">
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
                &bull; {{ relativeDate(post.date) }}
              </span>
              <q-item-label wrap class="text-wrap text-body1">
                {{ post.content }}
              </q-item-label>
              <div class="row q-mt-sm post-icons">
                <q-btn
                  @click="showPostComments(post.id)"
                  color="grey"
                  icon="far fa-comment"
                  size="sm"
                  flat
                  round
                >
                  &nbsp; {{ getNumberOfComments(post) }}
                </q-btn>
                <!-- <q-btn color="grey" icon="fas fa-retweet" size="sm" flat round>
                </q-btn> -->
                <q-btn
                  @click="toggleLiked(post)"
                  :color="isLiked(post) ? 'pink' : 'grey'"
                  :icon="isLiked(post) ? 'fa-solid fa-heart' : 'far fa-heart'"
                  size="sm"
                  flat
                  round
                  class="q-ml-md"
                >
                  &nbsp; {{ post.likes.length }}
                </q-btn>
                <q-btn
                  v-if="post.userId === loggedInUser.uid"
                  @click="deletePost(post)"
                  color="grey"
                  icon="fas fa-trash"
                  size="sm"
                  flat
                  round
                  class="q-ml-md"
                >
                </q-btn>
              </div>
            </q-item-section>
          </q-item>
        </transition-group>
      </q-list>
    </q-scroll-area>
  </q-page>
</template>

<script>
import { defineComponent } from "vue";
import { formatDistance } from "date-fns";
import db from "src/boot/firebase";
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  addDoc,
  doc,
  deleteDoc,
  updateDoc,
  where,
  getDocs,
} from "firebase/firestore";
import { mapState } from "vuex";
export default defineComponent({
  name: "PageHome",
  data() {
    return {
      newPostContent: "",
      posts: [],
      user: {},
      handle: "",
      comments: [],
      numDisplayedPosts: 20,
    };
  },
  computed: {
    ...mapState("myModule", ["loggedInUser"]),
    displayedPosts() {
      return this.posts.slice(0, this.numDisplayedPosts);
    },
  },
  methods: {
    loadMorePosts() {
      this.numDisplayedPosts += 20; // display 10 more posts
    },
    handleScroll() {
      const scrollArea = this.$refs.scrollArea.$el;
      const scrollPosition = scrollArea.scrollTop + scrollArea.offsetHeight;
      const scrollMax = scrollArea.scrollHeight;
      if (scrollPosition >= scrollMax) {
        this.loadMorePosts();
      }
    },
    getNumberOfComments(post) {
      let filteredComments = this.comments.filter(
        (comment) => comment.postId === post.id
      );
      return filteredComments.length;
    },
    showPostComments(postId) {
      this.$router.push({ name: "Comments", params: { postId } });
    },
    relativeDate(value) {
      return formatDistance(value, new Date());
    },
    addNewPost() {
      let newPost = {
        userId: this.user.uid,
        username: this.user.username,
        userhandle: this.handle,
        profilePic: this.user.profilePic,
        content: this.newPostContent,
        date: Date.now(),
        likes: [],
      };
      // this.posts.unshift(newPost)
      const docRef = addDoc(collection(db, "posts"), newPost);
      console.log("Document written with ID: ", docRef.id);
      this.newPostContent = "";
    },
    deletePost(post) {
      deleteDoc(doc(db, "posts", post.id));
    },
    async toggleLiked(post) {
      console.log(post);
      const postRef = doc(db, "posts", post.id);
      const userId = this.user.uid;
      const likes = post.likes || []; // set likes to an empty array if it is undefined
      const index = likes.indexOf(userId);
      if (index === -1) {
        likes.push(userId);
      } else {
        likes.splice(index, 1);
      }
      await updateDoc(postRef, { likes });

      // Update the post object in the local array
      post.likes = likes;

      // Update the number of likes in the UI
      const q = query(collection(db, "posts"), orderBy("date"));
      const snapshot = await getDocs(q);
      snapshot.forEach((doc) => {
        if (doc.id === post.id) {
          post.likes = doc.data().likes;
        }
      });
    },
    isLiked(post) {
      return post.likes.includes(this.loggedInUser.uid);
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
  },
  async mounted() {
    await this.fetchUserData();
    this.updateHandle();
    const q = query(collection(db, "posts"), orderBy("date"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        let postChange = change.doc.data();
        postChange.id = change.doc.id;
        if (change.type === "added") {
          console.log("New post: ", postChange);
          this.posts.unshift(postChange);
        }
        if (change.type === "modified") {
          console.log("Modified post: ", postChange);
          let index = this.posts.findIndex((post) => post.id === postChange.id);
          Object.assign(this.posts[index], postChange);
        }
        if (change.type === "removed") {
          console.log("Removed post: ", postChange);
          let index = this.posts.findIndex((post) => post.id === postChange.id);
          this.posts.splice(index, 1);
        }
      });
    });
    const q1 = query(collection(db, "comments"), orderBy("date"));
    const unsubscribe2 = onSnapshot(q1, (snapshot) => {
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
        this.fetchUserData();
        this.updateHandle();
      },
      deep: true,
    },
  },
});
</script>
<style scoped lang="sass">

.post-content
  white-space: pre-line

.new-post
  textarea
  font-size: 19px
  line-height: 1.4 !important

.divider
  border-top:1px solid
  border-bottom:1px solid
  border-color: $grey-4

.post-icons
  margin-left: -5px

.text-wrap
  white-space: normal !important
</style>
