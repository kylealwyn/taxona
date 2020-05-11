import React, { useState } from 'react';
import { usePhyla } from '../stores';

export default () => {
  const [todoInput, setTodoInput] = useState('');
  const [todos, addTodo, deleteTodo] = usePhyla(({ todo }) => [
    todo.state.todos,
    todo.actions.add,
    todo.actions.delete,
  ]);

  const onSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    addTodo(todoInput);
    setTodoInput('');
  };

  return (
    <div>
      {console.log('Rendering ToDo List')}
      <h2>ToDo List</h2>

      <ul>
        {todos.map((entry, i) => (
          <li key={entry}>
            {entry}
            &nbsp;
            <span onClick={() => deleteTodo(i)}>x</span>
          </li>
        ))}
      </ul>

      <form onSubmit={onSubmit}>
        <input value={todoInput} onChange={e => setTodoInput(e.target.value)} />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};
