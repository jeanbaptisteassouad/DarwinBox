import { State, Action, StateDirectoryCreatorParent } from "./types.ts";
import { ApiDirectoryNode } from "../api.ts";

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "succeedInitialFetch": {
      return succeedInitialFetch(state, action);
    }

    case "updateNameOfDirectoryCreator": {
      return updateNameOfDirectoryCreator(state, action);
    }
    case "updateParentInputValueOfDirectoryCreator": {
      return updateParentInputValueOfDirectoryCreator(state, action);
    }
    case "updateParentValueOfDirectoryCreator": {
      return updateParentValueOfDirectoryCreator(state, action);
    }

    case "tryToPostNewDirectory": {
      return tryToPostNewDirectory(state);
    }
    case "succeedToPostNewDirectory": {
      return succeedToPostNewDirectory(state, action);
    }
    case "userCreateDirectory": {
      return userCreateDirectory(state, action);
    }
    case "failedToPostNewDirectory": {
      return failedToPostNewDirectory(state);
    }

    case "succeedToPutNewDirectoryName": {
      return succeedToPutNewDirectoryName(state, action);
    }
    case "userRenameDirectory": {
      return userRenameDirectory(state, action);
    }

    case "succeedToDeleteDirectoryAndSubdirectories": {
      return succeedToDeleteDirectoryAndSubdirectories(state, action);
    }
    case "userDeleteDirectory": {
      return userDeleteDirectory(state, action);
    }

    default: {
      return state;
    }
  }
};

const succeedInitialFetch = (
  state: State,
  action: Extract<Action, { type: "succeedInitialFetch" }>,
): State => {
  if (state.type !== "success") {
    return state;
  }

  const parentOptions: Array<StateDirectoryCreatorParent> = [];

  const recursive = (node: ApiDirectoryNode) => {
    for (const sub of node.subs) {
      parentOptions.push({ id: sub.id, label: sub.name });
      recursive(sub);
    }
  };

  recursive(action.node);

  parentOptions.sort((a, b) => a.label.localeCompare(b.label));

  return {
    ...state,
    directoryCreator: {
      waitingForServer: false,
      anErrorOccurred: false,
      name: "",
      parentValue: null,
      parentInputValue: "",
      parentOptions,
    },
  };
};

const updateNameOfDirectoryCreator = (
  state: State,
  action: Extract<Action, { type: "updateNameOfDirectoryCreator" }>,
): State => {
  if (state.type !== "success") {
    return state;
  }

  return {
    ...state,
    directoryCreator: {
      ...state.directoryCreator,
      name: action.name,
      anErrorOccurred: false,
    },
  };
};

const updateParentInputValueOfDirectoryCreator = (
  state: State,
  action: Extract<Action, { type: "updateParentInputValueOfDirectoryCreator" }>,
): State => {
  if (state.type !== "success") {
    return state;
  }

  return {
    ...state,
    directoryCreator: {
      ...state.directoryCreator,
      parentInputValue: action.parentInputValue,
      anErrorOccurred: false,
    },
  };
};

const updateParentValueOfDirectoryCreator = (
  state: State,
  action: Extract<Action, { type: "updateParentValueOfDirectoryCreator" }>,
): State => {
  if (state.type !== "success") {
    return state;
  }

  return {
    ...state,
    directoryCreator: {
      ...state.directoryCreator,
      parentValue: action.parentValue,
      anErrorOccurred: false,
    },
  };
};

const tryToPostNewDirectory = (state: State): State => {
  if (state.type !== "success") {
    return state;
  }

  return {
    ...state,
    directoryCreator: {
      ...state.directoryCreator,
      waitingForServer: true,
      anErrorOccurred: false,
    },
  };
};

const succeedToPostNewDirectory = (
  state: State,
  action: Extract<Action, { type: "succeedToPostNewDirectory" }>,
): State => {
  return createDirectory(state, action.id, action.name);
};

const userCreateDirectory = (
  state: State,
  action: Extract<Action, { type: "userCreateDirectory" }>,
): State => {
  return createDirectory(state, action.id, action.name);
};

const createDirectory = (state: State, id: number, name: string): State => {
  if (state.type !== "success") {
    return state;
  }

  if (id <= state.maxId) {
    // Directory is already there.
    return state;
  }

  const parentOptions = [
    ...state.directoryCreator.parentOptions,
    { id, label: name },
  ];

  return {
    ...state,
    directoryCreator: {
      ...state.directoryCreator,
      waitingForServer: false,
      anErrorOccurred: false,
      name: "",
      parentValue: null,
      parentInputValue: "",
      parentOptions,
    },
  };
};

const failedToPostNewDirectory = (state: State): State => {
  if (state.type !== "success") {
    return state;
  }

  return {
    ...state,
    directoryCreator: {
      ...state.directoryCreator,
      waitingForServer: false,
      anErrorOccurred: true,
    },
  };
};

const succeedToPutNewDirectoryName = (
  state: State,
  action: Extract<Action, { type: "succeedToPutNewDirectoryName" }>,
): State => {
  return renameDirectory(state, action.id, action.name);
};

const userRenameDirectory = (
  state: State,
  action: Extract<Action, { type: "userRenameDirectory" }>,
): State => {
  return renameDirectory(state, action.id, action.name);
};

const renameDirectory = (state: State, id: number, name: string): State => {
  if (state.type !== "success") {
    return state;
  }

  // Check if the node is selected
  // as the parent in the directory creator
  // and update it.
  let parentValue = state.directoryCreator.parentValue;
  if (parentValue?.id === id) {
    parentValue = { ...parentValue, label: name };
  }

  // Update the options of directory creator.
  const directoryCreator = {
    ...state.directoryCreator,
    parentOptions: state.directoryCreator.parentOptions.map((option) => {
      if (option.id === id) {
        return { ...option, label: name };
      } else {
        return option;
      }
    }),
    parentValue,
  };

  return {
    ...state,
    directoryCreator,
  };
};

const succeedToDeleteDirectoryAndSubdirectories = (
  state: State,
  action: Extract<
    Action,
    { type: "succeedToDeleteDirectoryAndSubdirectories" }
  >,
): State => {
  return deleteDirectory(state, action.id);
};

const userDeleteDirectory = (
  state: State,
  action: Extract<Action, { type: "userDeleteDirectory" }>,
): State => {
  return deleteDirectory(state, action.id);
};

const deleteDirectory = (state: State, id: number): State => {
  if (state.type !== "success") {
    return state;
  }

  // Check if the node is selected
  // as the parent in the directory creator
  // and remove it.
  let parentValue = state.directoryCreator.parentValue;
  if (parentValue?.id === id) {
    parentValue = null;
  }

  // Update the options of directory creator.
  const directoryCreator = {
    ...state.directoryCreator,
    parentOptions: state.directoryCreator.parentOptions.filter((option) => {
      return option.id !== id;
    }),
    parentValue,
  };

  return {
    ...state,
    directoryCreator,
  };
};
