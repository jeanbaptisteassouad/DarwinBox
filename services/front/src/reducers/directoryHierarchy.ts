import { State, Action, StateDirectoryNode } from "./types.ts";
import { ApiDirectoryNode } from "../api.ts";
import {
  updateDirectoryNodeById,
  deleteDirectoryNodeById,
  insertDirectoryNodeById,
} from "./directoryNodeUtils.ts";

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "succeedInitialFetch": {
      return succeedInitialFetch(state, action);
    }

    case "succeedToPostNewDirectory": {
      return succeedToPostNewDirectory(state, action);
    }
    case "userCreateDirectory": {
      return userCreateDirectory(state, action);
    }

    case "startToEditDirectoryName": {
      return startToEditDirectoryName(state, action);
    }
    case "cancelDirectioryNameEdition": {
      return cancelDirectioryNameEdition(state, action);
    }
    case "updateTemporaryNewNameOfDirectory": {
      return updateTemporaryNewNameOfDirectory(state, action);
    }
    case "tryToPutNewDirectoryName": {
      return tryToPutNewDirectoryName(state, action);
    }
    case "succeedToPutNewDirectoryName": {
      return succeedToPutNewDirectoryName(state, action);
    }
    case "userRenameDirectory": {
      return userRenameDirectory(state, action);
    }

    case "failedToPutNewDirectoryName": {
      return failedToPutNewDirectoryName(state, action);
    }
    case "startToDeleteDirectoryNode": {
      return startToDeleteDirectoryNode(state, action);
    }
    case "cancelDirectoryNodeDeletion": {
      return cancelDirectoryNodeDeletion(state, action);
    }
    case "tryToDeleteDirectoryAndSubdirectories": {
      return tryToDeleteDirectoryAndSubdirectories(state, action);
    }
    case "succeedToDeleteDirectoryAndSubdirectories": {
      return succeedToDeleteDirectoryAndSubdirectories(state, action);
    }
    case "userDeleteDirectory": {
      return userDeleteDirectory(state, action);
    }
    case "failedToDeleteDirectoryAndSubdirectories": {
      return failedToDeleteDirectoryAndSubdirectories(state, action);
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

  const rootDirectory: StateDirectoryNode = {
    id: NaN,
    name: "",
    status: { type: "regular" },
    subs: [],
  };

  const recursive = (node: ApiDirectoryNode, current: StateDirectoryNode) => {
    for (const sub of node.subs) {
      const nextCurrent: StateDirectoryNode = {
        id: sub.id,
        name: sub.name,
        status: { type: "regular" },
        subs: [],
      };
      current.subs.push(nextCurrent);
      recursive(sub, nextCurrent);
    }
    current.subs.sort((a, b) => a.name.localeCompare(b.name));
  };

  recursive(action.node, rootDirectory);

  return {
    ...state,
    rootDirectory,
  };
};

const succeedToPostNewDirectory = (
  state: State,
  action: Extract<Action, { type: "succeedToPostNewDirectory" }>,
): State => {
  return createDirectory(state, action.id, action.name, action.parentId);
};

const userCreateDirectory = (
  state: State,
  action: Extract<Action, { type: "userCreateDirectory" }>,
): State => {
  return createDirectory(state, action.id, action.name, action.parentId);
};

const createDirectory = (
  state: State,
  id: number,
  name: string,
  parentId: null | number,
): State => {
  if (state.type !== "success") {
    return state;
  }

  if (id <= state.maxId) {
    // Directory is already there.
    return state;
  }

  const node: StateDirectoryNode = {
    id,
    name,
    status: { type: "regular" },
    subs: [],
  };

  return {
    ...state,
    rootDirectory: insertDirectoryNodeById(state.rootDirectory, parentId, node),
  };
};

const startToEditDirectoryName = (
  state: State,
  action: Extract<Action, { type: "startToEditDirectoryName" }>,
): State => {
  if (state.type === "success") {
    return {
      ...state,
      rootDirectory: updateDirectoryNodeById(
        state.rootDirectory,
        action.id,
        (node) => {
          return {
            ...node,
            status: {
              type: "rename",
              name: node.name,
              waitingForServer: false,
              anErrorOccurred: false,
            },
          };
        },
      ),
    };
  } else {
    return state;
  }
};

const cancelDirectioryNameEdition = (
  state: State,
  action: Extract<Action, { type: "cancelDirectioryNameEdition" }>,
): State => {
  if (state.type === "success") {
    return {
      ...state,
      rootDirectory: updateDirectoryNodeById(
        state.rootDirectory,
        action.id,
        (node) => {
          return {
            ...node,
            status: { type: "regular" },
          };
        },
      ),
    };
  } else {
    return state;
  }
};

const updateTemporaryNewNameOfDirectory = (
  state: State,
  action: Extract<Action, { type: "updateTemporaryNewNameOfDirectory" }>,
): State => {
  if (state.type !== "success") {
    return state;
  }

  return {
    ...state,
    rootDirectory: updateDirectoryNodeById(
      state.rootDirectory,
      action.id,
      (node) => {
        if (node.status.type === "rename") {
          return {
            ...node,
            status: { ...node.status, name: action.name },
          };
        } else {
          return node;
        }
      },
    ),
  };
};

const tryToPutNewDirectoryName = (
  state: State,
  action: Extract<Action, { type: "tryToPutNewDirectoryName" }>,
): State => {
  if (state.type !== "success") {
    return state;
  }

  return {
    ...state,
    rootDirectory: updateDirectoryNodeById(
      state.rootDirectory,
      action.id,
      (node) => {
        if (node.status.type === "rename") {
          return {
            ...node,
            status: { ...node.status, waitingForServer: true },
          };
        } else {
          return node;
        }
      },
    ),
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

  // Update the directory hierarchy.
  const rootDirectory = updateDirectoryNodeById(
    state.rootDirectory,
    id,
    (node) => {
      return {
        ...node,
        name,
        status: { type: "regular" },
      };
    },
  );

  return {
    ...state,
    rootDirectory,
  };
};

const failedToPutNewDirectoryName = (
  state: State,
  action: Extract<Action, { type: "failedToPutNewDirectoryName" }>,
) => {
  if (state.type !== "success") {
    return state;
  }

  return {
    ...state,
    rootDirectory: updateDirectoryNodeById(
      state.rootDirectory,
      action.id,
      (node) => {
        if (node.status.type === "rename") {
          return {
            ...node,
            status: {
              ...node.status,
              waitingForServer: false,
              anErrorOccurred: true,
            },
          };
        } else {
          return node;
        }
      },
    ),
  };
};

const startToDeleteDirectoryNode = (
  state: State,
  action: Extract<Action, { type: "startToDeleteDirectoryNode" }>,
): State => {
  if (state.type !== "success") {
    return state;
  }

  return {
    ...state,
    rootDirectory: updateDirectoryNodeById(
      state.rootDirectory,
      action.id,
      (node) => {
        return {
          ...node,
          status: {
            type: "delete",
            waitingForServer: false,
            anErrorOccurred: false,
          },
        };
      },
    ),
  };
};

const cancelDirectoryNodeDeletion = (
  state: State,
  action: Extract<Action, { type: "cancelDirectoryNodeDeletion" }>,
): State => {
  if (state.type !== "success") {
    return state;
  }

  return {
    ...state,
    rootDirectory: updateDirectoryNodeById(
      state.rootDirectory,
      action.id,
      (node) => {
        if (node.status.type === "delete") {
          return {
            ...node,
            status: { type: "regular" },
          };
        } else {
          return node;
        }
      },
    ),
  };
};

const tryToDeleteDirectoryAndSubdirectories = (
  state: State,
  action: Extract<Action, { type: "tryToDeleteDirectoryAndSubdirectories" }>,
): State => {
  if (state.type !== "success") {
    return state;
  }

  return {
    ...state,
    rootDirectory: updateDirectoryNodeById(
      state.rootDirectory,
      action.id,
      (node) => {
        if (node.status.type === "delete") {
          return {
            ...node,
            status: { ...node.status, waitingForServer: true },
          };
        } else {
          return node;
        }
      },
    ),
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

  return {
    ...state,
    rootDirectory: deleteDirectoryNodeById(state.rootDirectory, id),
  };
};

const failedToDeleteDirectoryAndSubdirectories = (
  state: State,
  action: Extract<Action, { type: "failedToDeleteDirectoryAndSubdirectories" }>,
): State => {
  if (state.type !== "success") {
    return state;
  }

  return {
    ...state,
    rootDirectory: updateDirectoryNodeById(
      state.rootDirectory,
      action.id,
      (node) => {
        if (node.status.type === "delete") {
          return {
            ...node,
            status: {
              ...node.status,
              waitingForServer: false,
              anErrorOccurred: true,
            },
          };
        } else {
          return node;
        }
      },
    ),
  };
};
