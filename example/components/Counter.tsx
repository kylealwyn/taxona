import React from 'react';
import { usePhyla } from '../stores';

export default function Counter() {
  const [count, increment, decrement] = usePhyla(({ counter }) => [
    counter.state.count,
    counter.actions.increment,
    counter.actions.decrement,
  ]);

  console.log('Rendering Counter');

  return (
    <div>
      <h2>Counter</h2>
      <button onClick={() => decrement()}>-</button>
      {count}
      <button onClick={() => increment()}>+</button>
    </div>
  );
}
