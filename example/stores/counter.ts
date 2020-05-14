import { createStore } from '../../lib/phyla';

export default createStore({
  state: {
    count: 0,
    testObj: {} as { test: number },
  },
  actions: {
    increment: (state) => {
      state.count += 1;
      state.testObj.test = 12;
    },
    decrement: (state) => {
      state.count -= 1;
    },
  },
});
