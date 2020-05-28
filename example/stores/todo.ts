import { createStore } from '../../lib/phyla';

export default createStore({
  state: {
    todos: [] as Array<string>,
  },
  actions: (state) => ({
    add: (newTodo: string) => {
      return new Promise((resolve) => {
        if (!newTodo) {
          return resolve();
        }

        setTimeout(() => {
          state.todos = [...state.todos, newTodo];
          resolve();
        });
      });
    },
    delete: (index: number) => {
      state.todos = state.todos.filter((_: string, i: number) => i !== index);
    },
  }),
});
