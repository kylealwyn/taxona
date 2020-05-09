import { createReducer } from '../dewey';

interface TodoState {
  todos: string[];
}

type TodoActions = {
  add(todo: string): any;
  delete(index: number): any;
}

export const reducer = createReducer<TodoState, TodoActions>({
  state: {
    todos: [],
  },
  actions: {
    add: (state, newTodo: string) => {
      return new Promise(resolve => {
        setTimeout(() => {
          state.todos = [...state.todos, newTodo]
          resolve();
        })
      })
    },
    delete: (state, index: number) => {
      state.todos.splice(index, 1);
    }
  }
});
