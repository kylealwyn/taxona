import { createReducer } from '../dewey';

export default createReducer({
  state: {
    count: 0,
  },
  actions: {
    increment: (state) => {
      state.__log = false;
      state.count += 1
    },
    decrement: (state) => {
      state.count -= 1
    }
  },
})
