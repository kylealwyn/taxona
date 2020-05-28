import { createStore } from '../../lib/phyla';

export default createStore({
  state: {
    count: 0,
  },
  actions: (state) => ({
    increment: () => {
      state.count += 1;
    },
    decrement: () => {
      state.count -= 1;
    },
  }),
});
