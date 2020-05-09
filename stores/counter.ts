import { createReducer } from '../dewey';

interface CounterState {
  count: number;
}

type CounterActions = {
  increment(): any;
  decrement(): any;
}

export const reducer = createReducer<CounterState, CounterActions>({
  state: {
    count: 0,
  },
  actions: {
    increment: (state) => {
      state.count += 1
    },
    decrement: (state) => {
      state.count -= 1
    }
  },
})
