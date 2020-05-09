import { useState, useEffect } from 'react';

let listeners = [];
let state = {};

function setState(newState) {
  state = { ...state, ...newState };
  listeners.forEach(listener => {
    listener(state);
  });
}

export default function useSharedState(initialState) {
  const [, newListener] = useState();

  if (initialState && Object.keys(state).length === 0) {
    state = initialState;
  }

  useEffect(() => {
    listeners.push(newListener);

    return () => {
      listeners = listeners.filter(e => e !== newListener);
    };
  }, []);

  return [state, setState];
}
