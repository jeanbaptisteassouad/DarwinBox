import { State, Action } from "./types.ts";

export const reducer = (state: State, action: Action): State => {
  if (state.type !== "success") {
    return state;
  }

  switch (action.type) {
    case "succeedInitialFetch": {
      return {
        ...state,
        maxId: state.directoryCreator.parentOptions.reduce((acc, val) => {
          return Math.max(acc, val.id);
        }, 0),
      };
    }
    case "succeedToPostNewDirectory": {
      return { ...state, maxId: Math.max(state.maxId, action.id) };
    }
    case "userCreateDirectory": {
      return { ...state, maxId: Math.max(state.maxId, action.id) };
    }
    default: {
      return state;
    }
  }
};
