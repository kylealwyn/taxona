import { createStore } from '../dewey';
import * as counter from './counter';
import * as todo from './todo';

export * from './counter';

export const { 
  Provider,
  useTaxona,
} = createStore({
  reducers: {
    counter: counter.reducer,
    todo: todo.reducer,
  }
})