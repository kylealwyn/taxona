import React from 'react';
import { render } from 'react-dom';
import { Provider } from './stores';
import Counter from './components/Counter';
import TodoList from './components/TodoList';

const App = () => (
  <Provider>
    <>
      <TodoList />
      <Counter />
    </>
  </Provider>
);

render(<App />, document.getElementById('root'));
