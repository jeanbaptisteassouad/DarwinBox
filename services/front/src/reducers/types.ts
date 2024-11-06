import { ApiDirectoryNode } from "../api.ts";

export type State =
  | {
      type: "loading";
    }
  | {
      type: "success";
      maxId: number;
      directoryCreator: StateDirectoryCreator;
      rootDirectory: StateDirectoryNode;
    }
  | {
      type: "error";
      error: unknown;
    };

export type StateDirectoryCreator = {
  waitingForServer: boolean;
  anErrorOccurred: boolean;

  // State for directory name TextField
  name: string;

  // State for parent directory Autocomplete
  parentValue: null | StateDirectoryCreatorParent;
  parentInputValue: string;
  parentOptions: Array<StateDirectoryCreatorParent>;
};

export type StateDirectoryCreatorParent = {
  label: string;
  id: number;
};

export type StateDirectoryNode = {
  id: number;
  name: string;
  status: StateDirectoryNodeStatus;
  subs: Array<StateDirectoryNode>;
};

export type StateDirectoryNodeStatus =
  | { type: "regular" }
  | {
      type: "rename";
      name: string;
      waitingForServer: boolean;
      anErrorOccurred: boolean;
    }
  | { type: "delete"; waitingForServer: boolean; anErrorOccurred: boolean };

export type Action =
  | { type: "succeedInitialFetch"; node: ApiDirectoryNode }
  | { type: "failedInitialFetch"; error: unknown }
  // Directory creator actions.
  | { type: "updateNameOfDirectoryCreator"; name: string }
  | {
      type: "updateParentInputValueOfDirectoryCreator";
      parentInputValue: string;
    }
  | {
      type: "updateParentValueOfDirectoryCreator";
      parentValue: null | StateDirectoryCreatorParent;
    }
  | {
      type: "tryToPostNewDirectory";
    }
  | {
      type: "succeedToPostNewDirectory";
      id: number;
      name: string;
      parentId: null | number;
    }
  | { type: "failedToPostNewDirectory" }
  // Directory node actions.
  | { type: "startToEditDirectoryName"; id: number }
  | { type: "cancelDirectioryNameEdition"; id: number }
  | { type: "updateTemporaryNewNameOfDirectory"; id: number; name: string }
  | { type: "tryToPutNewDirectoryName"; id: number }
  | { type: "succeedToPutNewDirectoryName"; id: number; name: string }
  | { type: "failedToPutNewDirectoryName"; id: number }
  | { type: "startToDeleteDirectoryNode"; id: number }
  | { type: "cancelDirectoryNodeDeletion"; id: number }
  | { type: "tryToDeleteDirectoryAndSubdirectories"; id: number }
  | { type: "succeedToDeleteDirectoryAndSubdirectories"; id: number }
  | { type: "failedToDeleteDirectoryAndSubdirectories"; id: number }
  // Websocket directory changes actions.
  | { type: "userRenameDirectory"; id: number; name: string }
  | { type: "userDeleteDirectory"; id: number }
  | {
      type: "userCreateDirectory";
      id: number;
      name: string;
      parentId: null | number;
    };
