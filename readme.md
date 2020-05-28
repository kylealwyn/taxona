<div align="center">
    <h1>Phyla</h1>
    <p>The successor to Synaptik</p>
</div>

## Features

### 💪 Strongly Typed
Phyla is built in and for Typescript. Because we create our consuming hook dynamically, it can automatically infer state and action typings.


### ⚡️ Reactive State
Phlya uses modern proxies to support simple, direct updates to local state and notifying all subscribers implicitly.


## Usage

1. Create your store
    ```tsx
    import { createStore } from 'phyla';

    export default createStore({
      state: {
        count: 0,
      },
      actions: {
        increment: (state) => {
          state.count += 1;
        },
        decrement: (state) => {
          state.count -= 1;
        },
      },
    });
    ```

2. Create a Phyla instance that returns our React provider and hook.
    ```tsx
    import { createPhyla } from 'phyla';
    import counter from './counter';

    export const { Provider, usePhyla } = createPhyla({
      counter,
    });
    ```

3. Wrap your application in the Provider
    ```tsx
    import { Provider } from './your-phyla';
    import Counter from './Counter';

    const App = () => (
      <Provider>
        <Counter />
      </Provider>
    );

    render(<App />, document.getElementById('root'));
    ```

4. Access your state in any of your components
    ```tsx
    import React from 'react';
    import { usePhyla } from './your-phyla';

    export default function Counter() {
      const [count, increment, decrement] = usePhyla(({ counter }) => [
        counter.state.count,
        counter.actions.increment,
        counter.actions.decrement,
      ]);

      return (
        <>
          <button onClick={() => decrement()}>-</button>
          {count}
          <button onClick={() => increment()}>+</button>
        </>
      );
    }
    ```

