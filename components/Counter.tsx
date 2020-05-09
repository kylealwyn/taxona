import React from 'react';
import { useTaxona } from '../stores';

export default function Counter() {
  const [count, increment, decrement] = useTaxona(({ counter }) => [
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
