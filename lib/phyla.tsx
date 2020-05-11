import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { createDraft, finishDraft } from 'immer';
import shallowEqual from './shallow-equal';
import { logStateChange } from './logger';

type Store<T> = {
  getState: () => void; 
  updateState: (reducerName: string, state: any) => void; 
  reducers: T;
  subscribe: (fn: Function) => () => void;
  notify: () => void;
}

type SubscriptionFn = (state: any) => any;
type BasicFn = (...args: any[]) => any;
interface BasicActions { [key: string]: BasicFn }

export function createPhyla<T>(reducers: T) {
  const state: {
    [reducerName: string]: any;
  } = {};
  const subscriptions: Map<number, SubscriptionFn> = new Map();
  let counter = 0;

  function subscribe(fn: SubscriptionFn) {
    const id = ++counter;
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
    return state;
  }

  function updateState(reducerName: string, newState: any) {
    state[reducerName] = newState;
    notify();
  }

  /** We need to proxy each reducer action */
  Object.keys(reducers).forEach((reducerName: string) => {
    // @ts-ignore
    const reducer = reducers[reducerName];

    reducer.actions = Object.keys(reducer.actions).reduce((acc: BasicActions, actionName: string) => {
      const actionFn = reducer.actions[actionName];

      acc[actionName] = async (payload: any) => {
        const groupName = `${reducerName}.${actionName}`;
    
        const initialState = { ...getState() };
        const draft = createDraft({ ...reducer.state, __log: true });
        await actionFn(draft, payload);
        const nextState = finishDraft(draft);

        reducer.state = nextState;
    
        updateState(reducerName, nextState);
        
        if (nextState.__log) {
          logStateChange(initialState, getState(), groupName);
        }
      }

      return acc;
    }, {})

    updateState(reducerName, reducer.state);
  });


  const contextValue = {
    getState,
    reducers,
    updateState,
    subscribe,
    notify,
  }

  const Context = createContext<Store<T>>(contextValue);

  const Provider: React.FC = ({ children }) => {
    return (
      <Context.Provider value={contextValue}>
        {children}
      </Context.Provider>
    )
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

  return {
    Provider,
    usePhyla,
  }
}

export function createPhylum<State, Actions extends BasicActions>({
  state,
  actions
}: {
  state: State;
  actions: {
    [P in keyof Actions]: (state: State & { __log: boolean }, ...args: Parameters<Actions[P]>) => any;
  };
}): {
  state: State;
  actions: {
    [P in keyof Actions]: (...args: Parameters<Actions[P]>) => any
  };
} {
  return {
    state: {
      ...state,
    },
    // @ts-ignore
    actions
  }
}
