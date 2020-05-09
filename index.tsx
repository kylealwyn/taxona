import React, { Fragment } from 'react';
import { render } from 'react-dom';
import { Provider } from './stores';
import Counter from './components/Counter';
import TodoList from './components/TodoList';

const App = () => (
  <Provider>
    <Fragment>
      <TodoList />
      <Counter />
    </Fragment>
  </Provider>
);

render(<App />, document.getElementById('root'));
