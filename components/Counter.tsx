import React from 'react';
import { store, CounterActions } from '../stores';

export default function Counter() {
  const [count, increment, decrement] = store.use<[
    number,
    CounterActions['increment'],
    CounterActions['decrement']
  ]>(({ counter }) => [
    counter.state.count,
    counter.actions.increment,
    counter.actions.decrement,
  ]);

  console.log('Rendering Counter')

  return (
    <div>
      <h2>Counter</h2>
      <button onClick={() => decrement()}>-</button>
      {count}
      <button onClick={() => increment()}>+</button>
    </div>
  );
}
