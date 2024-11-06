import { reducer as directoryCreatorReducer } from "./directoryCreator.ts";
import { reducer as directoryHierarchyReducer } from "./directoryHierarchy.ts";
import { reducer as maxIdReducer } from "./maxId.ts";
import { State, Action } from "./types.ts";

export const initialState = (): State => {
  return {
    type: "loading",
  };
};

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "succeedInitialFetch": {
      state = succeedInitialFetch();
      break;
    }
    case "failedInitialFetch": {
      state = failedInitialFetch(action);
      break;
    }
  }

  state = directoryCreatorReducer(state, action);
  state = directoryHierarchyReducer(state, action);
  state = maxIdReducer(state, action);
  return state;
};

const succeedInitialFetch = (): State => {
  return {
    type: "success",
    maxId: 0,
    directoryCreator: {
      waitingForServer: false,
      anErrorOccurred: false,

      name: "",

      parentValue: null,
      parentInputValue: "",
      parentOptions: [],
    },
    rootDirectory: {
      id: NaN,
      name: "",
      status: { type: "regular" },
      subs: [],
    },
  };
};

const failedInitialFetch = (
  action: Extract<Action, { type: "failedInitialFetch" }>,
): State => {
  return { type: "error", error: action.error };
};
