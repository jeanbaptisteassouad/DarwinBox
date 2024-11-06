import Card from "@mui/material/Card";
import React from "react";
import FolderIcon from "@mui/icons-material/Folder";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

import { StateDirectoryNode, Action } from "../reducers/types.ts";

import { renameDirectory, deleteDirectory } from "../api.ts";

const DirectoryNode = ({
  node,
  dispatch,
  willBeDeleted,
}: {
  node: StateDirectoryNode;
  dispatch: (a: Action) => void;
  willBeDeleted: boolean;
}) => {
  switch (node.status.type) {
    case "regular": {
      return (
        <RegularDirectoryNode
          node={node}
          dispatch={dispatch}
          willBeDeleted={willBeDeleted}
        />
      );
    }
    case "rename": {
      return (
        <RenameDirectoryNode
          node={node}
          newName={node.status.name}
          waitingForServer={node.status.waitingForServer}
          anErrorOccurred={node.status.anErrorOccurred}
          dispatch={dispatch}
          willBeDeleted={willBeDeleted}
        />
      );
    }
    case "delete": {
      return (
        <DeleteDirectoryNode
          node={node}
          waitingForServer={node.status.waitingForServer}
          anErrorOccurred={node.status.anErrorOccurred}
          dispatch={dispatch}
          willBeDeleted={willBeDeleted}
        />
      );
    }
  }
};

export default DirectoryNode;

const RegularDirectoryNode = ({
  node,
  dispatch,
  willBeDeleted,
}: {
  node: StateDirectoryNode;
  dispatch: (a: Action) => void;
  willBeDeleted: boolean;
}) => {
  const subElements = useSubdirectories({ node, dispatch, willBeDeleted });

  return (
    <>
      <div
        className="directoryNode"
        style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
      >
        <NodeCard>
          <DirectoryIcon willBeDeleted={willBeDeleted} />
          {node.name}
        </NodeCard>
        <EditIcon
          className="directoryNodeActionIcon edit"
          style={{ display: willBeDeleted ? "none" : "" }}
          onClick={() => {
            dispatch({ type: "startToEditDirectoryName", id: node.id });
          }}
        />
        <DeleteIcon
          className="directoryNodeActionIcon delete"
          style={{ display: willBeDeleted ? "none" : "" }}
          onClick={() => {
            dispatch({ type: "startToDeleteDirectoryNode", id: node.id });
          }}
        />
      </div>
      {subElements}
    </>
  );
};

const RenameDirectoryNode = ({
  node,
  newName,
  waitingForServer,
  anErrorOccurred,
  dispatch,
  willBeDeleted,
}: {
  node: StateDirectoryNode;
  newName: string;
  waitingForServer: boolean;
  anErrorOccurred: boolean;
  dispatch: (a: Action) => void;
  willBeDeleted: boolean;
}) => {
  const subElements = useSubdirectories({ node, dispatch, willBeDeleted });

  const disabled = waitingForServer || willBeDeleted;
  return (
    <>
      <form
        className="directoryNode"
        autoComplete="off"
        style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
        onSubmit={(event) => {
          event.preventDefault();
          dispatch({ type: "tryToPutNewDirectoryName", id: node.id });
          renameDirectory(node.id, newName)
            .then(() => {
              dispatch({
                type: "succeedToPutNewDirectoryName",
                id: node.id,
                name: newName,
              });
            })
            .catch(() => {
              dispatch({
                type: "failedToPutNewDirectoryName",
                id: node.id,
              });
            });
        }}
      >
        <NodeCard>
          <DirectoryIcon willBeDeleted={willBeDeleted} />
          <TextField
            required
            disabled={disabled}
            label="Directory name"
            variant="filled"
            value={newName}
            onChange={(event) => {
              const name = event.target.value;
              dispatch({
                type: "updateTemporaryNewNameOfDirectory",
                id: node.id,
                name,
              });
            }}
          />
        </NodeCard>
        <Button
          disabled={disabled}
          variant="outlined"
          onClick={() => {
            dispatch({ type: "cancelDirectioryNameEdition", id: node.id });
          }}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={disabled} variant="contained">
          Save
        </Button>
      </form>
      {anErrorOccurred && <ErrorCard />}
      {subElements}
    </>
  );
};

const DeleteDirectoryNode = ({
  node,
  waitingForServer,
  anErrorOccurred,
  dispatch,
  willBeDeleted,
}: {
  node: StateDirectoryNode;
  waitingForServer: boolean;
  anErrorOccurred: boolean;
  dispatch: (a: Action) => void;
  willBeDeleted: boolean;
}) => {
  const subElements = useSubdirectories({
    node,
    dispatch,
    willBeDeleted: true,
  });

  const disabled = waitingForServer || willBeDeleted;
  return (
    <>
      <form
        className="directoryNode"
        autoComplete="off"
        style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
        onSubmit={(event) => {
          event.preventDefault();
          dispatch({
            type: "tryToDeleteDirectoryAndSubdirectories",
            id: node.id,
          });
          deleteDirectory(node.id)
            .then(() => {
              dispatch({
                type: "succeedToDeleteDirectoryAndSubdirectories",
                id: node.id,
              });
            })
            .catch(() => {
              dispatch({
                type: "failedToDeleteDirectoryAndSubdirectories",
                id: node.id,
              });
            });
        }}
      >
        <NodeCard>
          <DirectoryIcon willBeDeleted={true} />
          {node.name}
        </NodeCard>
        <Button
          disabled={disabled}
          variant="outlined"
          onClick={() => {
            dispatch({ type: "cancelDirectoryNodeDeletion", id: node.id });
          }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={disabled}
          color="error"
          variant="contained"
        >
          Delete
        </Button>
      </form>
      {anErrorOccurred && <ErrorCard />}
      {subElements}
    </>
  );
};

const useSubdirectories = ({
  node,
  dispatch,
  willBeDeleted,
}: {
  node: StateDirectoryNode;
  dispatch: (a: Action) => void;
  willBeDeleted: boolean;
}) => {
  const nodes = React.useMemo(() => {
    return node.subs.map((node) => {
      return (
        <DirectoryNode
          key={node.id}
          node={node}
          dispatch={dispatch}
          willBeDeleted={willBeDeleted}
        />
      );
    });
  }, [node.subs, dispatch, willBeDeleted]);

  if (node.subs.length !== 0) {
    return <Indent willBeDeleted={willBeDeleted}>{nodes}</Indent>;
  } else {
    return null;
  }
};

const Indent = ({
  children,
  willBeDeleted,
}: {
  children: React.ReactNode;
  willBeDeleted: boolean;
}) => {
  return (
    <div
      style={{
        display: "flex",
        gap: "1rem",
      }}
    >
      <div
        style={{
          width: "0.5rem",
          marginLeft: "0.5rem",
          background: willBeDeleted ? "#e9aaa9" : "#d8e2e7",
          borderRadius: "4px",
        }}
      ></div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          width: "100%",
        }}
      >
        {children}
      </div>
    </div>
  );
};

const DirectoryIcon = ({ willBeDeleted }: { willBeDeleted: boolean }) => {
  if (willBeDeleted) {
    return <FolderIcon style={{ color: "#d2403f" }} />;
  } else {
    return <FolderIcon style={{ color: "#38b4f9" }} />;
  }
};

const NodeCard = ({ children }: { children: React.ReactNode }) => {
  return (
    <Card
      style={{
        padding: "0.5rem 12px",
        width: "fit-content",
        display: "flex",
        gap: "0.5rem",
        alignItems: "center",
      }}
    >
      {children}
    </Card>
  );
};

const ErrorCard = () => {
  return (
    <Card style={{ padding: "1rem 12px" }}>
      ❌ An unexpected error occurred during the request, please try again in a
      few moments.
    </Card>
  );
};
