import store from '../store/index'
const requireAuth = (to, from, next) => {
  if (!store.state.myModule.loggedInUser) {
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  } else {
    next()
  }
}
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('src/pages/PageHome.vue'), name:'Home',beforeEnter: requireAuth},
      { path: '/about', component: () => import('src/pages/PageAbout.vue'),name:'About'},
      { path: '/login', component: () => import('src/pages/LoginPage.vue'),name:'Login' },
      { path: '/register', component: () => import('src/components/RegisterPage.vue'),name:'Register'},
      { path: '/profile', component: () => import('src/pages/ProfilePage.vue'), name:'Profile',beforeEnter: requireAuth},
      { path: '/stats', component: () => import('src/pages/StatsPage.vue'), name:'Hall Of Records',beforeEnter: requireAuth},
      { path: '/comments/:postId', component: () => import('src/components/CommentsPage.vue'), name:'Comments', props: route => ({ postId: route.params.postId }),beforeEnter: requireAuth},
  ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]


export default routes



