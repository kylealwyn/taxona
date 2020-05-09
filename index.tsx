import React, { Fragment } from 'react';
import { render } from 'react-dom';
import { Provider } from './dewey';
import { store } from './stores';
import Counter from './components/Counter';
import TodoList from './components/TodoList';

const App = () => (
  <Provider store={store}>
    <Fragment>
      <TodoList />
      <Counter />
    </Fragment>
  </Provider>
);

render(<App />, window.root);
