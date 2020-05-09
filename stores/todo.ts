import { createReducer } from '../taxona';

export default createReducer({
  state: {
    todos: [] as Array<string>,
  },
  actions: {
    add: (state, newTodo: string) => {
      if (!newTodo) {
        return;
      }

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
