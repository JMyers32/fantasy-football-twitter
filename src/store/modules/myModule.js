export default {
    namespaced: true,
    state: {
     loggedInUser:JSON.parse(localStorage.getItem('user')) || '',
     originalDestination: localStorage.getItem('originalDestination') || ''
     
    },
    mutations: {
          SET_USER(state, user) {
            state.loggedInUser = user;
            localStorage.setItem('user',JSON.stringify(user));
          },
          LOGOUT(state) {
            setTimeout(() => {  // <-- wrap localStorage removal in setTimeout
              localStorage.removeItem('user');
              state.loggedInUser = '';
            }, 0)
            
          },
          ORIGINAL_DESTINATION(state,destination){
            state.originalDestination=destination;
          },
          CLEAR_DESTINATION(state){
            state.originalDestination='';
          }
    },
    actions: {
      // module actions
    },
    getters: {
      isAuthenticated(state) {
        return state.user !== null
      }
    }
  }