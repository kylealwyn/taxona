import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import shallowEqual from './shallow-equal';
import { createDraft, finishDraft } from 'immer';
import { logger, logStateChange } from './logger';

type Store = null | {
  subscribe: (fn: Function) => () => void;
}

interface WrapActionParams {
  getState: any;
  updateState: any;
  reducer: any;
  reducerName: string;
  actionName: string;
  actionFn: any;
}


const Context = createContext<Store>(null);

const wrapAction = ({
  getState,
  updateState,
  reducer,
  reducerName,
  actionName,
  actionFn
}: WrapActionParams) => {
  if (typeof actionFn !== 'function') {
    return actionFn
  }

  return async (payload: any) => {
    const groupName = `${reducerName}.${actionName}`;

    const initialState = { ...getState() };
    const draft = createDraft(reducer.state);
    await actionFn(draft, payload);
    const nextState = finishDraft(draft);
    reducer.state = nextState;

    updateState(reducerName, nextState);

    logStateChange(initialState, getState(), groupName);
  }
}

export function createStore<T>({
  reducers,
}: {
  reducers: T
}) {
  const state = {};
  const subscriptions = {};
  let counter = 0;

  function getState() {
    return state;
  }

  function updateState(reducerName: string, newState: any) {
    state[reducerName] = newState;
    notify();
  }

  function subscribe(fn: () => any) {
    let id = ++counter;
    subscriptions[id] = fn;

    return () => {
      delete subscriptions[id];
    };
  }

  function notify() {
    Object.keys(subscriptions).forEach(id => {
      let fn = subscriptions[id];
      typeof fn === 'function' && fn(state);
    });
  }

  Object.keys(reducers).forEach(reducerName => {
    const reducer = reducers[reducerName];

    reducer.actions = Object.keys(reducer.actions).reduce((acc, actionName: string) => {
      const actionFn = reducer.actions[actionName];
      acc[actionName] = wrapAction({ getState, updateState, reducer, reducerName, actionName, actionFn });
      return acc;
    }, {})

    updateState(reducerName, reducer.state);
  });

  return {
    reducers,
    getState,
    updateState,
    subscribe,
    notify,
    use<TSelected>(selector: (reducers: T) => TSelected, dependencies = []) {
      const store = useContext(Context);
      const select = () => selector(reducers);
      const [state, setState] = useState(select());

      // By default, our effect only fires on mount and unmount, meaning it won't see the
      // changes to state, so we use a mutable ref to track the current value
      const stateRef = useRef(state);

      useEffect(() => {
        // Helps to avoid running stale listeners after unmount
        let isUnsubscribed = false;

        const maybeUpdateState = () => {
          if (isUnsubscribed) {
            return;
          }

          const nextState = select();

          // Checking referential equality grants perf boost if selector is memoized
          if (
            nextState === stateRef.current ||
            shallowEqual(nextState, stateRef.current)
          ) {
            return;
          }

          stateRef.current = nextState;
          setState(nextState);
        };

        const unsubscribe = store.subscribe(maybeUpdateState);

        maybeUpdateState();

        return () => {
          unsubscribe();
          isUnsubscribed = true;
        };
      }, dependencies);

      return state;
    }
  }
}

type BasicFn = (...args: any[]) => any;
interface BasicActions { [key: string]: BasicFn }

type Action<State extends object, Actions extends BasicActions > = {
  [P in keyof Actions]: (state: State, ...args: Parameters<Actions[P]>) => any;
}

export function createReducer<State, Actions extends BasicActions>({
  state,
  actions
}: {
  state: State,
  actions: {
    [P in keyof Actions]: (state: State, ...args: Parameters<Actions[P]>) => any;
  }
}): {
  state: State,
  actions: {
    [P in keyof Actions]: (...args: Parameters<Actions[P]>) => any
  }
} {
  return {
    state,
    actions
  }
}

export function Provider({ store, children }) {
  return (
    <Context.Provider value={store}>
      {children}
    </Context.Provider>
  )
}
