import { createStore } from 'vuex'
import myModule from './modules/myModule'

const store = createStore({
  modules: {
    myModule
  },
  state: {
    // main store state properties
  },
  mutations: {
    // main store mutations
  },
  actions: {
    // main store actions
  },
  getters: {
    // main store getters
  }
})

export default store;