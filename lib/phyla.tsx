import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { isEqual, cloneDeep } from 'lodash';
import { logStateChange } from './logger';

type Store<T> = {
  getState: () => void;
  updateState: (reducerName: string, state: any) => void;
  reducers: T;
  subscribe: (fn: Function) => () => void;
  notify: () => void;
};

type SubscriptionFn = (state: any) => any;
type BasicFn = (...args: any[]) => any;
interface BasicActions {
  [key: string]: BasicFn;
}

const proxies = new WeakSet();
function buildProxy(target: any, callback: () => any) {
  return new Proxy(target, {
    get(target: any, key: string): any {
      const val = target[key];

      if (typeof val === 'object' && !proxies.has(val)) {
        const newProxy = buildProxy(val, callback);
        proxies.add(newProxy);
        target[key] = newProxy;
        return newProxy;
      }

      return val;
    },
    set(target: any, key: string, val: any) {
      target[key] = val;
      setTimeout(callback);
      return true;
    },
  });
}

export function createPhyla<T>(reducers: T) {
  const state: {
    [reducerName: string]: any;
  } = {};
  const subscriptions: Map<number, SubscriptionFn> = new Map();
  let internalId = 0;

  function subscribe(fn: SubscriptionFn) {
    const id = ++internalId;
    subscriptions.set(id, fn);

    return () => {
      subscriptions.delete(id);
    };
  }

  function notify() {
    for (const fn of subscriptions.values()) {
      fn(state);
    }
  }

  function getState() {
    return cloneDeep(state);
  }

  function updateState(reducerName: string, newState: any) {
    state[reducerName] = newState;
  }

  /** We need to proxy each reducer action */
  Object.keys(reducers).forEach((reducerName: string) => {
    // @ts-ignore
    const reducer = reducers[reducerName];

    reducer.state = buildProxy(reducer.state, notify);
    const generatedActions = reducer.actions(reducer.state);

    reducer.actions = Object.keys(generatedActions).reduce((actions: BasicActions, actionName: string) => {
      const actionFn = generatedActions[actionName];

      actions[actionName] = async (...args) => {
        const groupName = `${reducerName}.${actionName}`;
        const initialState = { ...getState() };

        await actionFn(...args);

        logStateChange(initialState, getState(), groupName);
      };

      return actions;
    }, {});

    state[reducerName] = reducer.state;
  });

  const contextValue = {
    getState,
    reducers,
    updateState,
    subscribe,
    notify,
  };

  const Context = createContext<Store<T>>(contextValue);

  const Provider: React.FunctionComponent = ({ children }) => {
    return <Context.Provider value={contextValue}>{children}</Context.Provider>;
  };

  function usePhyla<TSelected>(selector: (reducers: T) => TSelected, dependencies = []) {
    const store = useContext(Context);

    if (!store) {
      throw new Error('Yeah hi, you need to wrap your app in our Provider');
    }

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
        if (nextState === stateRef.current || isEqual(nextState, stateRef.current)) {
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

  return {
    Provider,
    usePhyla,
  };
}

export function createStore<State, Actions>({
  state,
  actions,
}: {
  state: State;
  actions: (state: State) => Actions;
}): {
  state: State;
  actions: Actions;
} {
  return {
    state: {
      ...state,
    },
    // @ts-ignore
    actions,
  };
}
